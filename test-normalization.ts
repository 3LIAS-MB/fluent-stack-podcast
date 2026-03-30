import { normalizeVocabulary } from './src/utils/vocabNormalization';

const n8nPayload = [
  {
    "category": "Technical Terms",
    "items": [
      {
        "term": "AI agent",
        "phonetic": "/eɪ aɪ ˈeɪdʒənt/",
        "english": "An autonomous entity that perceives its environment, plans actions, executes them, and iterates to achieve complex goals without constant human supervision.",
        "español": "Una entidad autónoma que percibe su entorno, planifica acciones, las ejecuta e itera para lograr objetivos complejos sin supervisión humana constante.",
        "example": "An AI agent can research, plan, and book a flight, handling all the steps independently."
      }
    ]
  },
  {
    "category": "Collocations",
    "items": [
      {
        "term": "maintains context",
        "english": "The ability of an AI system to remember and utilize information from previous interactions or observations to inform current and future actions.",
      }
    ]
  }
];

const normalized = normalizeVocabulary(n8nPayload);

console.log(JSON.stringify(normalized, null, 2));
