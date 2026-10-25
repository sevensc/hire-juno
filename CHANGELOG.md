# Changelog

## [0.2.0](https://github.com/sevensc/hire-juno/compare/hire-juno-v0.1.0...hire-juno-v0.2.0) (2026-10-25)


### Features

* add a mandatory sub-agent section to the personnel file template ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* add an appearance setting with System, Light and Dark to the chat ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* add copy buttons to chat messages and code blocks ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* **chat:** colleagues can move their conversation into a worktree themselves ([f1025cd](https://github.com/sevensc/hire-juno/commit/f1025cd59320c24770a2bdbc2c08135e209d5111))
* **chat:** continue a conversation in the Claude Code terminal ([52488e4](https://github.com/sevensc/hire-juno/commit/52488e4abd65ed1f3148f6d19ae3bb2f58141574))
* **chat:** keep sub-agent windows across reload and server restart ([53ff804](https://github.com/sevensc/hire-juno/commit/53ff804f49004d8128fb5bcd141da0ec9b04f849))
* **chat:** use the SubagentHandback text as a sub-agent's report ([5777995](https://github.com/sevensc/hire-juno/commit/577799545dba3589d15fcf0d1a8ec4bc9b2d9a8b))
* choose the model per conversation in the chat settings ([f21bff9](https://github.com/sevensc/hire-juno/commit/f21bff937b064e505b1fb51f4f6163170459b0bf))
* choose the model per conversation in the chat settings ([18f30b3](https://github.com/sevensc/hire-juno/commit/18f30b3aaba20e20bd7ed72e38a8b20233badaaa))
* keep image attachments in the chat across reloads ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* let a chat conversation work in its own git worktree, also in another repository, and show its branch ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* let supervisors give instructions outside a colleague's assignment and have Juno propose skills from journals ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* queue a chat message and withdraw it while it is unread ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* render chat messages with markdown-it (tables, nested lists, quotes, rules, strikethrough) ([f21bff9](https://github.com/sevensc/hire-juno/commit/f21bff937b064e505b1fb51f4f6163170459b0bf))
* render chat messages with markdown-it (tables, nested lists, quotes, rules, strikethrough) ([18f30b3](https://github.com/sevensc/hire-juno/commit/18f30b3aaba20e20bd7ed72e38a8b20233badaaa))
* show sub-agent windows with their brief and report, and keep them across reloads ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* show which chat tool calls ran without asking ([b344732](https://github.com/sevensc/hire-juno/commit/b34473269345af132ed836a6794439ce8fd62723))


### Bug Fixes

* keep a chat message written mid-turn below the colleague's live block ([f21bff9](https://github.com/sevensc/hire-juno/commit/f21bff937b064e505b1fb51f4f6163170459b0bf))
* keep a chat message written mid-turn below the colleague's live block ([18f30b3](https://github.com/sevensc/hire-juno/commit/18f30b3aaba20e20bd7ed72e38a8b20233badaaa))
* keep running chat turns alive when switching workforce and when switching back ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* let only Auto mode skip permission questions in the chat ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* limit the height of the live thinking box in the chat ([f21bff9](https://github.com/sevensc/hire-juno/commit/f21bff937b064e505b1fb51f4f6163170459b0bf))
* limit the height of the live thinking box in the chat ([18f30b3](https://github.com/sevensc/hire-juno/commit/18f30b3aaba20e20bd7ed72e38a8b20233badaaa))
* reopen the conversation that was open after a chat reload ([f21bff9](https://github.com/sevensc/hire-juno/commit/f21bff937b064e505b1fb51f4f6163170459b0bf))
* reopen the conversation that was open after a chat reload ([18f30b3](https://github.com/sevensc/hire-juno/commit/18f30b3aaba20e20bd7ed72e38a8b20233badaaa))
* restore a running turn, the stored conversation and the header figures after a chat reload or restart ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* show a typing line in the chat and keep text blocks and the text before a tool call ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))
* show the chat's scroll-to-bottom arrow only after scrolling up ([f21bff9](https://github.com/sevensc/hire-juno/commit/f21bff937b064e505b1fb51f4f6163170459b0bf))
* show the chat's scroll-to-bottom arrow only after scrolling up ([18f30b3](https://github.com/sevensc/hire-juno/commit/18f30b3aaba20e20bd7ed72e38a8b20233badaaa))
* start a fresh chat session when the saved one no longer exists ([f21bff9](https://github.com/sevensc/hire-juno/commit/f21bff937b064e505b1fb51f4f6163170459b0bf))
* start a fresh chat session when the saved one no longer exists ([18f30b3](https://github.com/sevensc/hire-juno/commit/18f30b3aaba20e20bd7ed72e38a8b20233badaaa))
* stop a long line of code from widening the chat message list ([6711062](https://github.com/sevensc/hire-juno/commit/6711062f663249e09ca6ecf6e4313a354083c0be))

## Changelog
