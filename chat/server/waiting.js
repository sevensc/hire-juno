// Messages the user sends while a colleague is still working on her turn.
// What happens to them was measured against the real SDK (a `Bash` call
// running when the message was sent, and a plain text turn):
//
//   - If a tool result follows, the message is folded into the running turn
//     at that point: one result, one reply that answers both.
//   - If the turn ends without another tool result, the message becomes a
//     turn of its own, answered by a second reply after the first.
//
// The message is stored on arrival, i.e. before the running turn's reply.
// That order is right in the first case. In the second the reply that ends
// the running turn has to come first, so the message is moved behind it
// (store.moveToEnd; history is ordered by id).
export class WaitingMessages {
  constructor(store) {
    this._store = store;
    this._ids = new Map(); // conversation key -> stored ids, oldest first
  }

  // A message was stored while a turn was running.
  add(key, id) {
    if (!this._ids.has(key)) this._ids.set(key, []);
    this._ids.get(key).push(id);
  }

  // A tool result arrived: everything that was waiting is part of the turn
  // now. Returns whether there was anything.
  folded(key) {
    const had = (this._ids.get(key)?.length ?? 0) > 0;
    this._ids.delete(key);
    return had;
  }

  // The turn's reply was stored. What still waits is answered after it:
  // it moves behind the reply, the oldest one starts (and stops waiting),
  // the others keep waiting under their new ids.
  afterReply(key) {
    const ids = this._ids.get(key);
    if (!ids?.length) return;
    const moved = this._store.moveToEnd(ids);
    moved.shift();
    this._ids.set(key, moved);
  }
}
