// Messages the user sends while a colleague is still working on her turn.
// What happens to them was measured against the real SDK (a `Bash` call
// running when the message was sent, and a plain text turn):
//
//   - If a tool result follows, the message is folded into the running turn
//     at that point: one result, one reply that answers both.
//   - If the turn ends without another tool result, the message becomes a
//     turn of its own, answered by a second reply after the first.
//
// A message sent with "Queue message" (kind 'queue') is sent with the SDK's
// priority 'later': it is never read at a tool result, always a turn of its
// own after the running one, so it is never folded.
//
// The message is stored on arrival, i.e. before the running turn's reply.
// That order is right in the first case. In the second the reply that ends
// the running turn has to come first, so the message is moved behind it
// (store.moveToEnd; history is ordered by id).
export class WaitingMessages {
  constructor(store) {
    this._store = store;
    this._entries = new Map(); // conversation key -> [{id, uuid, kind}], oldest first
  }

  // A message was stored while a turn was running. `id`: its stored row;
  // `uuid`: the name it was sent to the session under (to withdraw it);
  // `kind`: 'send' (may be read at the next tool result) or 'queue'.
  add(key, id, { uuid, kind = 'send' } = {}) {
    if (!this._entries.has(key)) this._entries.set(key, []);
    this._entries.get(key).push({ id, uuid, kind });
  }

  // What waits in this conversation, oldest first (copies).
  list(key) {
    return (this._entries.get(key) || []).map((e) => ({ ...e }));
  }

  // The waiting entry sent under this uuid, or undefined. The live entry:
  // its `id` follows the row when it is moved behind a reply.
  find(key, uuid) {
    return uuid ? (this._entries.get(key) || []).find((e) => e.uuid === uuid) : undefined;
  }

  // The message is gone (withdrawn) or known to be read: stops waiting.
  remove(key, uuid) {
    const entries = this._entries.get(key);
    const i = entries ? entries.findIndex((e) => e.uuid === uuid) : -1;
    if (i < 0) return undefined;
    const [entry] = entries.splice(i, 1);
    if (!entries.length) this._entries.delete(key);
    return entry;
  }

  // A tool result arrived: every waiting message that is not a queued one
  // is part of the turn now. Returns whether there was anything.
  folded(key) {
    const entries = this._entries.get(key) || [];
    const rest = entries.filter((e) => e.kind === 'queue');
    if (rest.length) this._entries.set(key, rest);
    else this._entries.delete(key);
    return rest.length < entries.length;
  }

  // The turn's reply was stored. What still waits is answered after it:
  // it moves behind the reply, the oldest one starts (and stops waiting),
  // the others keep waiting under their new ids.
  afterReply(key) {
    const entries = this._entries.get(key);
    if (!entries?.length) return;
    const moved = this._store.moveToEnd(entries.map((e) => e.id));
    entries.forEach((e, i) => { e.id = moved[i]; });
    entries.shift();
    if (!entries.length) this._entries.delete(key);
  }

  // The user takes a waiting message back. Asks the adapter to drop it
  // from the session's queue; only if that worked is the stored row (and
  // its images) deleted. Otherwise the session has read it (or it is not
  // waiting anymore): it stays in the history and stops waiting. A failing
  // call changes nothing: it keeps waiting. Returns {cancelled, error?}.
  async withdraw(key, uuid, adapter) {
    const entry = this.find(key, uuid);
    if (!entry) return { cancelled: false };
    let cancelled = false;
    try {
      cancelled = adapter?.canCancel ? (await adapter.cancel(uuid)) === true : false;
    } catch {
      return { cancelled: false, error: true };
    }
    // The entry object is the live one: its id is current even if a reply
    // moved the row while the adapter was asked.
    this.remove(key, uuid);
    if (cancelled) this._store.deleteMessage(entry.id);
    return { cancelled };
  }
}
