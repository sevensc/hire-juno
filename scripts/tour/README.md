# Feature tour

How the video in the main README (`docs/media/hire-juno-tour.mp4`) is
made, and how to record it again.

Everything in it is made up: the workforce "Sample Studio" (Juno, Ivo,
Mara, Tess), the two people (Robin, Jo) and the GitHub organisation
"sample-studio" with its repositories, issues and pull requests. The
screens are the real chat. The colleagues answer from `script.json`
through the scripted adapter (`chat/server/adapters/scripted.js`, chosen
only when `HIRE_JUNO_DEMO_SCRIPT` names a script), so no model is
called; GitHub is the stand-in in `fake-gh/`, so nothing goes to the
network.

## Files

- `workforce/`: the made-up team; Juno and the HR processes are copied
  from the template at setup.
- `script.json`: what the colleagues answer, matched by the messages
  they receive. Steps: thinking, tool lines (with `"ask": true` they go
  through the chat's real permission check), sub-agent windows, text.
- `fake-gh/`: a stand-in for the GitHub CLI with the organisation's
  data; changes are kept in a JSON file.
- `setup.mjs`: builds the team, local stand-ins for the repositories,
  home folders for Robin and Jo, the team room, and starts one chat per
  person on ports 4911 (Robin) and 4912 (Jo).
- `record.mjs`: plays the scenes in a browser, records each one, adds
  title cards and cuts them into one MP4.

## Recording

Needs Playwright (any recent version, not a dependency of this package)
and ffmpeg with VP8 and H.264.

```
node scripts/tour/setup.mjs /tmp/sample-studio        # keeps running
PLAYWRIGHT=<path to the playwright package> node scripts/tour/record.mjs /tmp/tour-video
```

The scripted answers are played once each, so record against a freshly
set-up team. The result is `/tmp/tour-video/hire-juno-tour.mp4`.
