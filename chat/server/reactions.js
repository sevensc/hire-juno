// Quick reactions to a colleague's message: a fixed set of emoji, each a
// short instruction she receives with the reaction (the conversation shows
// only the emoji and the quoted message).

export const REACTIONS = {
  yes: {
    emoji: '👍',
    hint: 'The person answered the quoted message with 👍: yes, go ahead with what you proposed or asked. This reaction only means yes to a yes-or-no question. If the quoted message did not ask one, do not act on it: say so briefly and ask what they want.',
  },
  no: {
    emoji: '✖️',
    hint: 'The person answered the quoted message with ✖️: no. If there is a sensible alternative, propose one; otherwise accept the no and do not pursue it.',
  },
  knowledge: {
    emoji: '📖',
    hint: "The person answered the quoted message with 📖: work with the team's recorded knowledge on this. Look up what is recorded about it, or record what was said where the team keeps its knowledge, whichever fits. Say briefly what you read or wrote and where.",
  },
  question: {
    emoji: '❓',
    hint: 'The person answered the quoted message with ❓: note this as an open question where you keep open points, and confirm briefly where you noted it.',
  },
};

// The instruction for a reaction key, or '' for none or an unknown one.
export function reactionHint(key) {
  return REACTIONS[key]?.hint || '';
}
