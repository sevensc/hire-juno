// A turn can hold several text blocks, one before and one after each tool
// call. The stream delivers their text one chunk after the other with
// nothing in between, so the live bubble ran them together ("…Punkt 5.Der
// Fix…"). `separatorFor(event)` returns the blank line to put in front of
// a text block that follows an earlier one in the same turn, '' otherwise;
// `reset()` starts the next turn.
//
// The same object also keeps the finished text blocks of the turn
// (`addText`), because the SDK's final `result` string holds only the last
// one: whatever the colleague wrote before a tool call would otherwise be
// gone from the stored reply. `turnText(fallback)` joins them with a blank
// line, or returns `fallback` when no text block was seen.
//
// `event` is the stream event of a `stream_event` message; a text block
// starts with {type: 'content_block_start', content_block: {type: 'text'}}.
export class TextBlockSeparator {
  constructor() {
    this._seen = false;
    this._texts = [];
  }

  addText(text) {
    if (typeof text === 'string' && text.trim()) this._texts.push(text.trim());
  }

  turnText(fallback) {
    return this._texts.length ? this._texts.join('\n\n') : fallback;
  }

  separatorFor(event) {
    if (event?.type !== 'content_block_start' || event.content_block?.type !== 'text') return '';
    const separator = this._seen ? '\n\n' : '';
    this._seen = true;
    return separator;
  }

  reset() {
    this._seen = false;
    this._texts = [];
  }
}
