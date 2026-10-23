// A turn can hold several text blocks, one before and one after each tool
// call. The stream delivers their text one chunk after the other with
// nothing in between, so the live bubble ran them together ("…Punkt 5.Der
// Fix…"). `separatorFor(event)` returns the blank line to put in front of
// a text block that follows an earlier one in the same turn, '' otherwise;
// `reset()` starts the next turn.
//
// `event` is the stream event of a `stream_event` message; a text block
// starts with {type: 'content_block_start', content_block: {type: 'text'}}.
export class TextBlockSeparator {
  constructor() {
    this._seen = false;
  }

  separatorFor(event) {
    if (event?.type !== 'content_block_start' || event.content_block?.type !== 'text') return '';
    const separator = this._seen ? '\n\n' : '';
    this._seen = true;
    return separator;
  }

  reset() {
    this._seen = false;
  }
}
