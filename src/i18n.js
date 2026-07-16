// Language for the wizard's own prompts — asked first, before terminal
// vs. browser is even chosen, because both paths read from here.
//
// Free text, not a picklist: typing "Deutsch" works the
// same as picking it from a menu would, without a menu to translate
// itself. Matched against a few common languages this file actually
// carries translations for — anything else falls back to English for
// the wizard's own prompts, because translating arbitrary free text
// without calling out to an LLM isn't something this installer can
// honestly do offline, and a browser-side LLM call would break the
// "nothing leaves your machine" privacy the setup page promises.
// What still works for ANY typed language, matched or not: the raw
// text lands in Juno's own personnel file ("respond in <language>"),
// and she — being the LLM, not this script — genuinely translates
// ad-hoc at conversation time. No code needed for that part; it's the
// one piece "ad-hoc translation" can actually mean without a network
// call.

export const LANGUAGES = [
  { code: 'en', englishName: 'English', match: ['english', 'en'] },
  { code: 'de', englishName: 'German', match: ['deutsch', 'german', 'de'] },
  { code: 'fr', englishName: 'French', match: ['francais', 'french', 'fr'] },
  { code: 'es', englishName: 'Spanish', match: ['espanol', 'spanish', 'es'] },
];

function normalize(s) {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function detectLanguage(input) {
  const known = LANGUAGES.find((l) => l.match.includes(normalize(input)));
  if (known) return { code: known.code, englishName: known.englishName };
  return { code: 'en', englishName: input.trim() };
}

// Module-level, not threaded through every function call: this is a
// single-run CLI process, one language for the whole run, set once
// right after askLanguage() resolves. Both wizard paths (prompts.js in
// this same process, web/server.js serving the browser page from this
// same process) read the same value without passing it as a parameter
// everywhere.
let currentLang = 'en';

export function setLanguage(code) {
  currentLang = LANGUAGES.some((l) => l.code === code) ? code : 'en';
}

export function getLanguage() {
  return currentLang;
}

// Keyed by the English source string (with {placeholder} spots filled
// in by `vars`) rather than symbolic keys — keeps the English text as
// the single readable source of truth and the diff small when a string
// changes: no separate key to keep in sync.
export function t(text, vars) {
  let out = currentLang === 'en' ? text : (STRINGS[text]?.[currentLang] ?? text);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(v);
  }
  return out;
}

const STRINGS = {
  'Setup cancelled — nothing was written.': {
    de: 'Setup abgebrochen — nichts wurde geschrieben.',
    fr: "Configuration annulée — rien n'a été écrit.",
    es: 'Configuración cancelada — no se escribió nada.',
  },
  'set up your AI workforce': {
    de: 'richte deine KI-Belegschaft ein',
    fr: "configurez votre équipe d'IA",
    es: 'configura tu equipo de IA',
  },
  'What language should Juno use with you? (e.g. English, German, French, Spanish — or type your own)': {
    de: 'In welcher Sprache soll Juno mit dir sprechen? (z. B. English, German, French, Spanish — oder eigene eingeben)',
    fr: 'Dans quelle langue Juno doit-elle vous parler ? (ex. English, German, French, Spanish — ou saisissez la vôtre)',
    es: '¿En qué idioma debería hablarte Juno? (p. ej. English, German, French, Spanish — o escribe el tuyo)',
  },
  'Terminal or browser?': {
    de: 'Terminal oder Browser?',
    fr: 'Terminal ou navigateur ?',
    es: '¿Terminal o navegador?',
  },
  'the usual prompts': {
    de: 'die gewohnten Eingabeaufforderungen',
    fr: 'les invites habituelles',
    es: 'las indicaciones habituales',
  },
  Browser: {
    de: 'Browser',
    fr: 'Navigateur',
    es: 'Navegador',
  },
  'a setup page with a live preview of what gets written': {
    de: 'eine Einrichtungsseite mit Live-Vorschau, was geschrieben wird',
    fr: 'une page de configuration avec un aperçu en direct de ce qui sera écrit',
    es: 'una página de configuración con una vista previa en vivo de lo que se escribirá',
  },
  'What should your team be called?': {
    de: 'Wie soll dein Team heißen?',
    fr: "Comment votre équipe doit-elle s'appeler ?",
    es: '¿Cómo debería llamarse tu equipo?',
  },
  'Required.': {
    de: 'Erforderlich.',
    fr: 'Obligatoire.',
    es: 'Obligatorio.',
  },
  'Workforce ID: {id} (derived from the name, used internally, never shown again)': {
    de: 'Workforce-ID: {id} (aus dem Namen abgeleitet, intern genutzt, wird nicht noch einmal angezeigt)',
    fr: "ID d'équipe : {id} (dérivé du nom, utilisé en interne, ne sera plus jamais affiché)",
    es: 'ID del equipo: {id} (derivado del nombre, uso interno, no se mostrará de nuevo)',
  },
  'What is this workforce for?': {
    de: 'Wofür ist dieses Team?',
    fr: 'À quoi sert cette équipe ?',
    es: '¿Para qué es este equipo?',
  },
  'Personal project': {
    de: 'Persönliches Projekt',
    fr: 'Projet personnel',
    es: 'Proyecto personal',
  },
  'Small startup': {
    de: 'Kleines Startup',
    fr: 'Petite startup',
    es: 'Pequeña startup',
  },
  'Organization / company': {
    de: 'Organisation / Unternehmen',
    fr: 'Organisation / entreprise',
    es: 'Organización / empresa',
  },
  'Something else': {
    de: 'Etwas anderes',
    fr: 'Autre chose',
    es: 'Otra cosa',
  },
  'Something else / not sure yet': {
    de: 'Etwas anderes / noch nicht sicher',
    fr: 'Autre chose / pas encore sûr',
    es: 'Otra cosa / aún no estoy seguro',
  },
  'Describe it in a few words': {
    de: "Beschreib's in wenigen Worten",
    fr: 'Décrivez-le en quelques mots',
    es: 'Descríbelo en pocas palabras',
  },
  'Where should your team live? (a folder — tab-completes)': {
    de: 'Wo soll dein Team leben? (ein Ordner — Tab-Vervollständigung)',
    fr: 'Où votre équipe doit-elle vivre ? (un dossier — complétion par tabulation)',
    es: '¿Dónde debería vivir tu equipo? (una carpeta — autocompletado con tabulador)',
  },
  'Where should your team live?': {
    de: 'Wo soll dein Team leben?',
    fr: 'Où votre équipe doit-elle vivre ?',
    es: '¿Dónde debería vivir tu equipo?',
  },
  "Who will be Juno's supervisor?": {
    de: 'Wer wird Junos Supervisor?',
    fr: 'Qui sera le superviseur de Juno ?',
    es: '¿Quién será el supervisor de Juno?',
  },
  'Which tool do you use?': {
    de: 'Welches Tool nutzt du?',
    fr: 'Quel outil utilisez-vous ?',
    es: '¿Qué herramienta usas?',
  },
  'manual wiring for now': {
    de: 'vorerst manuell einbinden',
    fr: "câblage manuel pour l'instant",
    es: 'conexión manual por ahora',
  },
  'Initialize a git repository here?': {
    de: 'Hier ein Git-Repository initialisieren?',
    fr: 'Initialiser un dépôt git ici ?',
    es: '¿Inicializar un repositorio git aquí?',
  },
  'Remote URL to add as "origin"? (optional — press Enter to skip)': {
    de: 'Remote-URL, die als "origin" hinzugefügt werden soll? (optional — Enter zum Überspringen)',
    fr: "URL distante à ajouter en tant qu'« origin » ? (facultatif — Entrée pour ignorer)",
    es: '¿URL remota para añadir como "origin"? (opcional — pulsa Enter para omitir)',
  },
  'Remote URL to add as "origin"': {
    de: 'Remote-URL, die als "origin" hinzugefügt wird',
    fr: "URL distante à ajouter en tant qu'« origin »",
    es: 'URL remota para añadir como "origin"',
  },
  '(optional)': {
    de: '(optional)',
    fr: '(facultatif)',
    es: '(opcional)',
  },
  '{n} file(s) already exist at that location and will be overwritten. Continue?': {
    de: '{n} Datei(en) existieren an diesem Ort bereits und werden überschrieben. Fortfahren?',
    fr: '{n} fichier(s) existent déjà à cet endroit et seront écrasés. Continuer ?',
    es: '{n} archivo(s) ya existen en esa ubicación y se sobrescribirán. ¿Continuar?',
  },
  'Written to {dir}.': {
    de: 'Geschrieben nach {dir}.',
    fr: 'Écrit dans {dir}.',
    es: 'Escrito en {dir}.',
  },
  'Talk to Juno: "@agent-juno" or "claude --agent juno" once {dir} is your working directory.': {
    de: 'Sprich mit Juno: „@agent-juno" oder „claude --agent juno", sobald {dir} dein Arbeitsverzeichnis ist.',
    fr: 'Parlez à Juno : « @agent-juno » ou « claude --agent juno » une fois que {dir} est votre répertoire de travail.',
    es: 'Habla con Juno: "@agent-juno" o "claude --agent juno" una vez que {dir} sea tu directorio de trabajo.',
  },
  'No adapter generator for {tool} yet. team/juno/profile.md works as a system prompt as-is — wire it into {tool} by hand, the same way you would any other custom agent.': {
    de: 'Für {tool} gibt es noch keinen Adapter-Generator. team/juno/profile.md funktioniert unverändert als System-Prompt — bind sie händisch in {tool} ein, genau wie jeden anderen eigenen Agenten.',
    fr: "Pas encore de générateur d'adaptateur pour {tool}. team/juno/profile.md fonctionne tel quel comme prompt système — intégrez-le manuellement dans {tool}, comme pour tout autre agent personnalisé.",
    es: 'Todavía no hay generador de adaptador para {tool}. team/juno/profile.md funciona tal cual como prompt de sistema — conéctalo a mano en {tool}, igual que cualquier otro agente personalizado.',
  },
  "Git setup didn't finish ({error}) — the files are still there, just run `git init` yourself.": {
    de: 'Git-Einrichtung wurde nicht abgeschlossen ({error}) — die Dateien sind trotzdem da, führe einfach selbst `git init` aus.',
    fr: "La configuration git n'a pas abouti ({error}) — les fichiers sont toujours là, lancez simplement `git init` vous-même.",
    es: 'La configuración de git no terminó ({error}) — los archivos siguen ahí, simplemente ejecuta `git init` tú mismo.',
  },
  "First move: tell Juno what keeps landing on your desk, and she'll run the hiring conversation for your first real colleague.": {
    de: 'Erster Schritt: Sag Juno, was dir ständig auf den Tisch landet, und sie führt das Einstellungsgespräch für deine erste echte Kollegin.',
    fr: "Première étape : dites à Juno ce qui atterrit constamment sur votre bureau, et elle mènera l'entretien d'embauche pour votre première vraie collègue.",
    es: 'Primer paso: dile a Juno qué es lo que no deja de llegarte, y ella llevará la conversación de contratación para tu primera colega real.',
  },
  'Good choice.': { de: 'Gute Wahl.', fr: 'Bon choix.', es: 'Buena elección.' },
  'Noted.': { de: 'Notiert.', fr: 'Noté.', es: 'Anotado.' },
  'Got it.': { de: 'Verstanden.', fr: 'Compris.', es: 'Entendido.' },
  'Nice.': { de: 'Schön.', fr: 'Sympa.', es: 'Bien.' },
  'Locked in.': { de: 'Festgehalten.', fr: "C'est acté.", es: 'Decidido.' },
  'On it.': { de: 'Bin dran.', fr: "Je m'en occupe.", es: 'Voy con eso.' },
  'Set up your AI workforce': {
    de: 'Richte deine KI-Belegschaft ein',
    fr: "Configurez votre équipe d'IA",
    es: 'Configura tu equipo de IA',
  },
  "A handful of quick questions, one at a time. The last step shows exactly what's about to be written, with your own input highlighted, before anything touches disk.": {
    de: 'Ein paar kurze Fragen, eine nach der anderen. Der letzte Schritt zeigt genau, was geschrieben wird, mit deiner Eingabe hervorgehoben, bevor irgendetwas auf die Festplatte kommt.',
    fr: "Quelques questions rapides, une à la fois. La dernière étape montre exactement ce qui va être écrit, avec votre saisie mise en évidence, avant que rien ne touche le disque.",
    es: 'Un puñado de preguntas rápidas, una a la vez. El último paso muestra exactamente lo que se va a escribir, con tu entrada resaltada, antes de que nada toque el disco.',
  },
  Team: { de: 'Team', fr: 'Équipe', es: 'Equipo' },
  'Use case': { de: 'Verwendung', fr: 'Usage', es: 'Uso' },
  Folder: { de: 'Ordner', fr: 'Dossier', es: 'Carpeta' },
  Supervisor: { de: 'Supervisor', fr: 'Superviseur', es: 'Supervisor' },
  Tool: { de: 'Tool', fr: 'Outil', es: 'Herramienta' },
  Git: { de: 'Git', fr: 'Git', es: 'Git' },
  Review: { de: 'Überblick', fr: 'Revue', es: 'Revisión' },
  'Team (or company / project) name': {
    de: 'Team- (oder Firmen-/Projekt-)Name',
    fr: "Nom de l'équipe (ou de l'entreprise / du projet)",
    es: 'Nombre del equipo (o empresa / proyecto)',
  },
  Continue: { de: 'Weiter', fr: 'Continuer', es: 'Continuar' },
  Back: { de: 'Zurück', fr: 'Retour', es: 'Atrás' },
  Cancel: { de: 'Abbrechen', fr: 'Annuler', es: 'Cancelar' },
  "Supervisor's name": {
    de: 'Name des Supervisors',
    fr: 'Nom du superviseur',
    es: 'Nombre del supervisor',
  },
  'The person Juno reports to.': {
    de: 'Die Person, der Juno unterstellt ist.',
    fr: 'La personne à qui Juno rend compte.',
    es: 'La persona a quien Juno reporta.',
  },
  Yes: { de: 'Ja', fr: 'Oui', es: 'Sí' },
  No: { de: 'Nein', fr: 'Non', es: 'No' },
  'Your input, highlighted in the actual files about to be written.': {
    de: 'Deine Eingabe, hervorgehoben in den tatsächlichen Dateien, die geschrieben werden.',
    fr: 'Votre saisie, mise en évidence dans les fichiers réels qui vont être écrits.',
    es: 'Tu entrada, resaltada en los archivos reales que se van a escribir.',
  },
  'Write the files': {
    de: 'Dateien schreiben',
    fr: 'Écrire les fichiers',
    es: 'Escribir los archivos',
  },
  'New folder': { de: 'Neuer Ordner', fr: 'Nouveau dossier', es: 'Nueva carpeta' },
  'Use this folder': {
    de: 'Diesen Ordner verwenden',
    fr: 'Utiliser ce dossier',
    es: 'Usar esta carpeta',
  },
  'Pre-selected: looks like you are running this from {tool}.': {
    de: 'Vorausgewählt: sieht so aus, als würdest du das aus {tool} heraus ausführen.',
    fr: 'Présélectionné : il semble que vous exécutiez ceci depuis {tool}.',
    es: 'Preseleccionado: parece que estás ejecutando esto desde {tool}.',
  },
  'Workforce ID: {id} (derived, used internally)': {
    de: 'Workforce-ID: {id} (abgeleitet, intern genutzt)',
    fr: "ID d'équipe : {id} (dérivé, utilisé en interne)",
    es: 'ID del equipo: {id} (derivado, uso interno)',
  },
  'Could not create that folder: {error}': {
    de: 'Der Ordner konnte nicht erstellt werden: {error}',
    fr: 'Impossible de créer ce dossier : {error}',
    es: 'No se pudo crear esa carpeta: {error}',
  },
  'Writing…': { de: 'Schreibe…', fr: 'Écriture…', es: 'Escribiendo…' },
  Written: { de: 'Geschrieben', fr: 'Écrit', es: 'Escrito' },
  'Check your terminal — this tab can be closed.': {
    de: 'Schau in dein Terminal — dieser Tab kann geschlossen werden.',
    fr: 'Regardez votre terminal — cet onglet peut être fermé.',
    es: 'Mira tu terminal — esta pestaña se puede cerrar.',
  },
  'Waiting for you in the browser…': {
    de: 'Warte auf dich im Browser…',
    fr: 'En attente dans le navigateur…',
    es: 'Esperando en el navegador…',
  },
  'Got it — back in the terminal.': {
    de: 'Alles klar — zurück im Terminal.',
    fr: "C'est noté — retour au terminal.",
    es: 'Entendido — de vuelta en la terminal.',
  },
  'Writing files…': {
    de: 'Schreibe Dateien…',
    fr: 'Écriture des fichiers…',
    es: 'Escribiendo archivos…',
  },
  'Browse…': { de: 'Durchsuchen…', fr: 'Parcourir…', es: 'Explorar…' },
  'Written {n} files.': {
    de: '{n} Dateien geschrieben.',
    fr: '{n} fichiers écrits.',
    es: '{n} archivos escritos.',
  },
};
