# Diagram sources

Static SVGs embedded in the main README, not live Mermaid code blocks —
GitHub wraps every rendered `` ```mermaid `` block in its own pan/zoom/
fullscreen controls, which is the wrong feel for a small illustrative
diagram meant to be read at a glance, not manipulated.

Each `.svg` is generated from its `.mmd` source of the same name.
Regenerate after editing a `.mmd`:

```
npx @mermaid-js/mermaid-cli -i docs/diagrams/hiring.mmd -o docs/diagrams/hiring.svg
npx @mermaid-js/mermaid-cli -i docs/diagrams/assessment.mmd -o docs/diagrams/assessment.svg
```

Then strip the hard-coded white background mermaid-cli adds (so the
image doesn't sit in a white card on a dark-theme reader):

```
sed -i '' 's/background-color: white;//' docs/diagrams/*.svg
```
