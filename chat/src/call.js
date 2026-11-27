// Video calls in the team room: browser to browser (WebRTC), one
// connection per other participant. Signalling goes through the chat's own
// WebSocket and the room (see server/index.js 'call_signal' and
// room/server.js 'signal'); the room never sees audio or video.
//
// Each tab has its own id, so two tabs of the same person do not mix up
// their connections. Signals:
//   join     (to everyone)  I am in the call now
//   here     (to one tab)   I am in the call too, reply to join or probe
//   probe    (to everyone)  is a call running?
//   offer / answer / ice    connection setup between two tabs
//   leave    (to everyone)  I left
// Who sends the offer between two tabs is fixed by comparing their keys,
// so both sides never offer at once.
//
// Every connection carries two video channels from the start: the camera
// and a second one for a shared screen. Sharing puts the screen on the
// second channel (no new negotiation needed), so the others see the
// camera and the screen at the same time.

export function createCallController({ sendSignal, fetchIce, onChange }) {
  const tab = Math.random().toString(36).slice(2, 10);
  let me = null; // room member id of this person
  let local = null; // MediaStream
  let iceServers = [];
  const peers = new Map(); // key -> { member, tab, pc, stream }
  const others = new Map(); // key -> { member, seen } of tabs in a call, for "join" while not in it
  let joined = false;
  let micOn = true;
  let camOn = true;
  let screen = null; // MediaStream of a shared screen, while sharing
  const sharingPeers = new Set(); // keys of peers sharing their screen
  const transcribing = new Map(); // key -> member of tabs writing a transcript
  const away = new Set(); // keys of peers whose app is in the background

  const key = (member, t) => `${member}:${t}`;
  const myKey = () => key(me, tab);
  const changed = () => onChange?.(state());

  function state() {
    for (const [k, o] of others) if (Date.now() - o.seen > 90000) others.delete(k);
    return {
      joined,
      me,
      transcribedBy: [...new Set(transcribing.values())],
      micOn,
      camOn,
      local,
      screen,
      canShareScreen: Boolean(navigator.mediaDevices?.getDisplayMedia),
      peers: [...peers.values()].map((p) => ({
        key: key(p.member, p.tab),
        member: p.member,
        stream: p.stream,
        screenStream: sharingPeers.has(key(p.member, p.tab)) ? p.screenStream : null,
        sharing: sharingPeers.has(key(p.member, p.tab)),
        paused: away.has(key(p.member, p.tab)) || Boolean(p.stream?.getVideoTracks()[0]?.muted),
      })),
      runningWithout: !joined && others.size > 0,
      othersInCall: [...new Set([...others.values()].map((o) => o.member))],
    };
  }

  function send(to, data) {
    sendSignal(to, { ...data, tab });
  }

  function peerFor(member, peerTab) {
    const k = key(member, peerTab);
    if (peers.has(k)) return peers.get(k);
    const pc = new RTCPeerConnection({ iceServers });
    const peer = { member, tab: peerTab, pc, stream: null, screenStream: null, camSender: null, screenTx: null };
    peers.set(k, peer);
    for (const track of local.getTracks()) {
      const sender = pc.addTrack(track, local);
      if (track.kind === 'video') peer.camSender = sender;
    }
    if (screen) send(member, { kind: 'sharing', on: true, toTab: peerTab });
    pc.onicecandidate = (event) => {
      if (event.candidate) send(member, { kind: 'ice', toTab: peerTab, candidate: event.candidate.toJSON() });
    };
    pc.ontrack = (event) => {
      // Video arriving on any channel but the camera's is a shared screen.
      if (event.track.kind === 'video' && event.transceiver.sender !== peer.camSender) {
        peer.screenStream = new MediaStream([event.track]);
        changed();
        return;
      }
      if (peer.stream && !peer.stream.getTracks().includes(event.track)) peer.stream.addTrack(event.track);
      else if (!peer.stream) peer.stream = event.streams[0] || new MediaStream([event.track]);
      // A phone stops sending video when its app goes to the background.
      event.track.onmute = changed;
      event.track.onunmute = changed;
      changed();
    };
    pc.onconnectionstatechange = () => {
      if (['failed', 'closed'].includes(pc.connectionState)) dropPeer(k);
      else changed();
    };
    changed();
    return peer;
  }

  function dropPeer(k) {
    const peer = peers.get(k);
    if (!peer) return;
    peers.delete(k);
    sharingPeers.delete(k);
    transcribing.delete(k);
    away.delete(k);
    try { peer.pc.close(); } catch { /* already closed */ }
    changed();
  }

  // The second video channel, sending the screen while one is shared.
  async function openScreenChannel(peer, transceiver) {
    peer.screenTx = transceiver;
    transceiver.direction = 'sendrecv';
    if (screen) await transceiver.sender.replaceTrack(screen.getVideoTracks()[0]).catch(() => {});
  }

  async function offerTo(member, peerTab) {
    const peer = peerFor(member, peerTab);
    await openScreenChannel(peer, peer.pc.addTransceiver('video', { direction: 'sendrecv' }));
    const offer = await peer.pc.createOffer();
    await peer.pc.setLocalDescription(offer);
    send(member, { kind: 'offer', toTab: peerTab, sdp: peer.pc.localDescription.toJSON() });
  }

  // A tab that is in the call too: whoever has the greater key offers.
  function meet(member, peerTab) {
    if (!joined || peers.has(key(member, peerTab))) return;
    if (myKey() > key(member, peerTab)) offerTo(member, peerTab).catch(() => dropPeer(key(member, peerTab)));
  }

  async function handle(from, data) {
    if (!data || typeof data.tab !== 'string') return;
    if (data.toTab && data.toTab !== tab) return;
    const k = key(from, data.tab);
    switch (data.kind) {
      case 'probe':
        if (joined) send(from, { kind: 'here', toTab: data.tab });
        return;
      case 'join':
        others.set(k, { member: from, seen: Date.now() });
        if (joined) {
          send(from, { kind: 'here', toTab: data.tab });
          meet(from, data.tab);
        }
        changed();
        return;
      case 'here':
        others.set(k, { member: from, seen: Date.now() });
        meet(from, data.tab);
        changed();
        return;
      case 'away':
        if (data.on) away.add(k);
        else away.delete(k);
        changed();
        return;
      case 'transcribing':
        if (data.on) transcribing.set(k, from);
        else transcribing.delete(k);
        changed();
        return;
      case 'sharing':
        if (data.on) sharingPeers.add(k);
        else sharingPeers.delete(k);
        changed();
        return;
      case 'leave':
        others.delete(k);
        dropPeer(k);
        changed();
        return;
      case 'offer': {
        if (!joined) return;
        const peer = peerFor(from, data.tab);
        await peer.pc.setRemoteDescription(data.sdp);
        // The offer's second video channel, if the other side has one
        // (an older app does not; then the screen replaces the camera).
        const extra = peer.pc.getTransceivers().find((t) => t.receiver.track.kind === 'video' && t.sender !== peer.camSender);
        if (extra && !peer.screenTx) await openScreenChannel(peer, extra);
        const answer = await peer.pc.createAnswer();
        await peer.pc.setLocalDescription(answer);
        send(from, { kind: 'answer', toTab: data.tab, sdp: peer.pc.localDescription.toJSON() });
        return;
      }
      case 'answer': {
        const peer = peers.get(k);
        if (peer) await peer.pc.setRemoteDescription(data.sdp);
        return;
      }
      case 'ice': {
        const peer = peers.get(k);
        if (peer && data.candidate) await peer.pc.addIceCandidate(data.candidate).catch(() => {});
        return;
      }
      default:
    }
  }

  // Puts the screen (or nothing) on the second video channel; for a peer
  // without one (older app) the screen replaces the camera as before.
  async function setScreenTrack(track) {
    const camera = local?.getVideoTracks()[0] || null;
    await Promise.all([...peers.values()].map((peer) => {
      if (peer.screenTx) return peer.screenTx.sender.replaceTrack(track).catch(() => {});
      return peer.camSender ? peer.camSender.replaceTrack(track || camera).catch(() => {}) : null;
    }));
  }

  return {
    tab,
    state,
    // Called with every 'call_signal' the chat's WebSocket delivers.
    onSignal(from, data) {
      handle(from, data).catch(() => {});
    },
    // Asks whether a call is running (when the team room is opened).
    probe() {
      sendSignal('*', { kind: 'probe', tab });
    },
    async join() {
      if (joined) return;
      const ice = await fetchIce();
      me = ice.you?.id || 'me';
      iceServers = ice.iceServers || [];
      local = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user' } });
      joined = true;
      micOn = true;
      camOn = true;
      send('*', { kind: 'join' });
      changed();
    },
    // Sends the screen to everyone in the call on the second video channel;
    // the camera keeps running.
    async shareScreen() {
      if (!joined || screen) return;
      screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const track = screen.getVideoTracks()[0];
      track.onended = () => this.stopScreen();
      await setScreenTrack(track);
      send('*', { kind: 'sharing', on: true });
      changed();
    },
    async stopScreen() {
      if (!screen) return;
      for (const t of screen.getTracks()) t.stop();
      screen = null;
      await setScreenTrack(null);
      send('*', { kind: 'sharing', on: false });
      changed();
    },
    // Tells the others that this app went to the background or came back.
    setAway(on) {
      if (joined) send('*', { kind: 'away', on });
    },
    // Tells everyone in the call that this tab writes a transcript, or stopped.
    announceTranscribing(on) {
      send('*', { kind: 'transcribing', on });
    },
    leave() {
      if (!joined) return;
      if (screen) {
        for (const t of screen.getTracks()) t.stop();
        screen = null;
      }
      send('*', { kind: 'leave' });
      for (const k of [...peers.keys()]) dropPeer(k);
      for (const track of local?.getTracks() || []) track.stop();
      local = null;
      joined = false;
      changed();
    },
    toggleMic() {
      micOn = !micOn;
      for (const track of local?.getAudioTracks() || []) track.enabled = micOn;
      changed();
    },
    toggleCam() {
      camOn = !camOn;
      for (const track of local?.getVideoTracks() || []) track.enabled = camOn;
      changed();
    },
  };
}
