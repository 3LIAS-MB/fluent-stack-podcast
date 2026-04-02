import { Captions, EpisodeFormat, EpisodeLevel, VocabularyInput } from '../types';
import ragCaptions from './rag-captions.json';

export const SHARED_AUDIO_URL = 'ElevenLabs1.mp3';
export const SHARED_IMAGE_URL = 'img/solo/background.jpg';
export const SHARED_TITLE = 'Mastering RAG: The Architecture for 2025';
export const SHARED_LEVEL: EpisodeLevel = 'Advanced C1-C2';
export const SHARED_FORMAT: EpisodeFormat = 'solo';
export const SHARED_CAPTIONS = ragCaptions as Captions;

export const SHARED_VOCABULARY: VocabularyInput = [
  {
    category: "Technical Terms",
    items: [
      {
        term: 'RAG',
        phonetic: '/ˈræɡ/',
        english: 'Retrieval Augmented Generation - grounding LLMs in external data for better accuracy.',
        español: 'Generación Aumentada por Recuperación - fundamentar LLMs en datos externos.',
        example: 'RAG helps prevent AI models from hallucinating false information.'
      },
      {
        term: 'LLM',
        phonetic: '/ˌɛl ɛl ˈɛm/',
        english: 'Large Language Model - A model trained on massive amounts of text.',
        español: 'Modelo de Lenguaje Grande - entrenado con cantidades masivas de texto.',
        example: 'We used an LLM to generate the initial draft of the documentation.'
      },
      {
        term: 'Embedding',
        phonetic: '/ɪmˈbɛdɪŋ/',
        english: 'Converting text into numerical vectors that capture meaning.',
        español: 'Convertir texto en vectores numéricos que capturan su significado.',
        example: 'We used an embedding model to map the document text into a vector space.'
      },
      {
        term: 'Vector Database',
        phonetic: '/ˈvɛktər ˈdeɪtəˌbeɪs/',
        english: 'Database specialized in storing and searching mathematical vectors.',
        español: 'Base de datos especializada en vectores matemáticos.',
        example: 'A vector database allows fast similarity search across millions of embeddings.'
      },
      {
        term: 'Context Window',
        phonetic: '/ˈkɑntɛkst ˈwɪndoʊ/',
        english: 'The maximum amount of text an LLM can process at once.',
        español: 'La cantidad máxima de texto que un LLM puede procesar a la vez.',
        example: 'If the text exceeds the context window, the model will forget earlier instructions.'
      },
      {
        term: "AI agent",
        phonetic: "/eɪ aɪ ˈeɪdʒənt/",
        english: "An autonomous entity that perceives its environment, plans actions, executes them, and iterates to achieve complex goals without constant human supervision.",
        español: "Una entidad autónoma que percibe su entorno, planifica acciones, las ejecuta e itera para lograr objetivos complejos sin supervisión humana constante.",
        example: "An AI agent can research, plan, and book a flight, handling all the steps independently."
      },
      {
        term: "tool use",
        phonetic: "/tuːl juːs/",
        english: "The capability of an AI agent to invoke external functions or APIs (tools) to access information or perform actions in the real world.",
        español: "La capacidad de un agente de IA para invocar funciones o APIs externas (herramientas) para acceder a información o realizar acciones en el mundo real.",
        example: "With tool use, an AI agent can browse the internet, call an API, or execute code."
      },
      {
        term: "task decomposition",
        phonetic: "/tæsk diːˌkɒmpəˈzɪʃən/",
        english: "The process of breaking down a large, complex goal into smaller, more manageable sub-tasks.",
        español: "El proceso de desglosar un objetivo grande y complejo en subtareas más pequeñas y manejables.",
        example: "Before solving a complex problem, an AI agent performs task decomposition to identify individual steps."
      },
      {
        term: "LLM (Large Language Model)",
        phonetic: "/el el em/",
        english: "A type of AI model trained on vast amounts of text data, capable of generating human-like text, translating, summarizing, and answering questions.",
        español: "Un tipo de modelo de IA entrenado con grandes cantidades de datos de texto, capaz de generar texto similar al humano, traducir, resumir y responder preguntas.",
        example: "Many developers use an LLM to generate code snippets or summarize articles."
      },
      {
        term: "autonomous entity",
        phonetic: "/ɔːˈtɒnəməs ˈɛntɪti/",
        english: "A system or agent that can operate independently and make decisions without constant human intervention.",
        español: "Un sistema o agente que puede operar de forma independiente y tomar decisiones sin intervención humana constante.",
        example: "An AI agent is an autonomous entity that can pursue goals on its own."
      },
      {
        term: "sub-tasks",
        phonetic: "/ˈsʌb tɑːsks/",
        english: "Smaller, manageable components or steps that a larger, complex task is broken down into.",
        español: "Componentes o pasos más pequeños y manejables en los que se descompone una tarea compleja y de mayor tamaño.",
        example: "The agent breaks down the main objective into several sub-tasks to achieve it efficiently."
      },
      {
        term: "tractable",
        phonetic: "/ˈtræktəbl/",
        english: "Of a problem or task, capable of being easily managed, solved, or dealt with.",
        español: "De un problema o tarea, capaz de ser manejado, resuelto o tratado fácilmente.",
        example: "By breaking it down, the large project became a series of tractable sub-tasks."
      },
      {
        term: 'Chunking',
        phonetic: '/ˈtʃʌŋkɪŋ/',
        english: 'Breaking large documents into smaller semantic pieces.',
        español: 'Dividir documentos grandes en fragmentos más pequeños.',
        example: 'Proper chunking ensures we only send relevant paragraphs to the model.'
      },
      {
        term: 'Re-ranking',
        phonetic: '/riˈræŋkɪŋ/',
        english: 'The process of reordering an initial set of retrieved results to improve relevance before passing them to the LLM.',
        español: 'El proceso de reordenar un conjunto inicial de resultados recuperados para mejorar la relevancia antes de enviarlos al modelo de lenguaje.',
        example: 'We added a re-ranking layer to filter out irrelevant chunks before sending them to the model.'
      },
      {
        term: 'Hybrid Search',
        phonetic: '/ˈhaɪbrɪd ˈsɜrtʃ/',
        english: 'Combining vector similarity with traditional keyword search.',
        español: 'Combinar búsqueda vectorial con búsqueda tradicional.',
        example: 'Hybrid search gives us the best of both worlds: exact matches and semantic relevance.'
      }
    ]
  },
  {
    category: "Implementation",
    items: [
      {
        term: 'Attribution',
        phonetic: '/ˌætrɪˈbjuʃən/',
        english: 'Citing specific sources for information provided by an AI.',
        español: 'Citar fuentes específicas para la información.',
        example: 'Attribution is critical in enterprise AI to build trust with users.'
      },
      {
        term: 'Cosine Similarity',
        phonetic: '/ˈkoʊsaɪn ˌsɪmɪˈlɛrɪti/',
        english: 'A metric used to measure how similar two vectors are.',
        español: 'Métrica utilizada para medir qué tan similares son dos vectores.',
        example: 'We used cosine similarity to find the most relevant documents in the database.'
      },
      {
        term: 'Vector Store',
        phonetic: '/ˈvɛktər ˈstɔr/',
        english: 'A system for managing and querying document embeddings.',
        español: 'Sistema para gestionar y consultar embeddings.',
        example: 'We decided to use Redis as an in-memory vector store.'
      },
      {
        term: 'Pinecone',
        phonetic: '/ˈpaɪnˌkoʊn/',
        english: 'A popular managed vector database service.',
        español: 'Un servicio popular de base de datos vectorial.',
        example: 'Pinecone handles the scaling of the vector indices automatically for us.'
      },
      {
        term: 'Prompt Engineering',
        phonetic: '/ˈprɑmpt ˌɛndʒɪˈnɪrɪŋ/',
        english: 'Crafting inputs to get the best results from an LLM.',
        español: 'Ingeniería de prompts para obtener mejores resultados.',
        example: 'Effective prompt engineering drastically reduced our error rate.'
      }
    ]
  },
  {
    category: "Collocations",
    items: [
      {
        term: "maintains context",
        phonetic: "/meɪnˈteɪnz ˈkɒntɛkst/",
        english: "The ability of an AI system to remember and utilize information from previous interactions or observations to inform current and future actions.",
        español: "La capacidad de un sistema de IA para recordar y utilizar información de interacciones u observaciones previas para informar acciones actuales y futuras.",
        example: "Unlike a simple LLM, an AI agent maintains context across multiple interactions, enabling more coherent behavior."
      },
      {
        term: "perceive its environment",
        phonetic: "/pərˈsiːv ɪts ɪnˈvaɪrənmənt/",
        english: "To gather information about its surroundings, inputs, or current state from various sensors or data sources.",
        español: "Recopilar información sobre su entorno, entradas o estado actual a partir de diversos sensores o fuentes de datos.",
        example: "An AI agent needs to perceive its environment to make informed decisions and plan its next steps."
      },
      {
        term: "provision cloud resources",
        phonetic: "/prəˈvɪʒən klaʊd ˈriːsɔːrsɪz/",
        english: "To allocate and set up necessary computing resources, such as virtual machines, databases, or networks, within a cloud computing environment.",
        español: "Asignar y configurar los recursos informáticos necesarios, como máquinas virtuales, bases de datos o redes, dentro de un entorno de computación en la nube.",
        example: "An AI agent could automate the process to provision cloud resources for a new project."
      },
      {
        term: "automating entire workflows",
        phonetic: "/ˈɔːtəmeɪtɪŋ ɪnˈtaɪər ˈwɜːrkfloʊz/",
        english: "The process of designing and implementing systems that perform a series of related tasks or operations without human intervention from start to finish.",
        español: "El proceso de diseñar e implementar sistemas que realizan una serie de tareas u operaciones relacionadas sin intervención humana de principio a fin.",
        example: "AI agents are shifting the focus from simple code generation to automating entire workflows."
      }
    ]
  }
];
