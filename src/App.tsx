import { Player } from "@remotion/player";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import React, { useEffect, useState } from "react";
import "./styles.css";
import { PodcastVideo } from "./compositions/PodcastVideo";
import { normalizeVocabulary } from "./utils/vocabNormalization";
import { VocabularyInput, EpisodeLevel, EpisodeFormat, Captions } from "./types";
import ragCaptions from "./data/rag-captions.json";

// ── Audio de preview ─────────────────────────────────────────────────────────
const PREVIEW_AUDIO = 'ElevenLabs1.mp3';
const PREVIEW_IMAGE = 'img/solo/background.jpg';

// Preview vocabulary — 5 items por categoría (20 total) para demo completa
const defaultVocabulary: VocabularyInput = [
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
      }
    ]
  },
  {
    category: "Concepts",
    items: [
      {
        term: 'Hallucination',
        phonetic: '/həˌlusɪˈneɪʃən/',
        english: 'When an AI provides false information with confidence.',
        español: 'Cuando una IA proporciona información falsa con seguridad.',
        example: 'The chatbot suffered from a severe hallucination issue and cited fake papers.'
      },
      { 
        term: 'Semantic Search', 
        phonetic: '/sɪˈmæntɪk ˈsɜrtʃ/',
        english: 'Searching based on meaning rather than just keyword matching.', 
        español: 'Búsqueda basada en el significado en lugar de palabras clave.',
        example: 'Semantic search can find relevant results even if the user asks using different words.'
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
  }
];

const FPS = 30;
const AUDIO_BUFFER_FRAMES = 15;
const ITEMS_PER_PAGE = 8;
const FRAMES_PER_PAGE = 150; // 5s × 30fps

/**
 * Genera captions de preview distribuidas uniformemente a lo largo de la duración del audio.
 * Las palabras se agrupan con pausas de 0.5s entre bloques para que buildSubtitleBlocks
 * las divida correctamente, haciendo el preview fiel al comportamiento del render real.
 */
function generatePreviewCaptions(audioDurationSeconds: number): Captions {
  const SAMPLE_WORDS = [
    'Welcome', 'to', 'Fluent', 'Stack', 'Podcast',
    'Today', 'we', 'talk', 'about', 'APIs',
    'and', 'how', 'they', 'power', 'modern',
    'software', 'Let', 'us', 'explore', 'REST',
    'GraphQL', 'design', 'patterns', 'in', 'depth',
  ];

  const WORD_DURATION = 0.28; // duración por palabra (s)
  const WORD_GAP = 0.05;      // pausa entre palabras del mismo bloque
  const BLOCK_PAUSE = 0.5;    // pausa entre bloques (≥ PAUSE_THRESHOLD en buildSubtitleBlocks)
  const WORDS_PER_BLOCK = 5;

  const words: Captions['words'] = [];
  let t = 0.3;
  let wordIdx = 0;

  while (t < audioDurationSeconds - WORD_DURATION) {
    const posInBlock = words.length % WORDS_PER_BLOCK;
    words.push({
      word: SAMPLE_WORDS[wordIdx % SAMPLE_WORDS.length],
      start: t,
      end: t + WORD_DURATION,
      speaker: 'Host' as const,
    });
    wordIdx++;
    t += WORD_DURATION;
    t += posInBlock === WORDS_PER_BLOCK - 1 ? BLOCK_PAUSE : WORD_GAP;
  }

  return { words };
}

export default function App() {
  const [durationInFrames, setDurationInFrames] = useState<number>(600);
  const [captions, setCaptions] = useState<Captions>({
    words: [{ word: 'Loading', start: 0, end: 1.0, speaker: 'Host' as const }],
  });

  useEffect(() => {
    getAudioDurationInSeconds(PREVIEW_AUDIO)
      .then((seconds) => {
        setCaptions(ragCaptions as Captions);

        // Duración total = audioDurationFrames + vocabRecapDuration
        const audioDurationFrames = Math.ceil(seconds * FPS) + AUDIO_BUFFER_FRAMES;
        const normalizedVocab = normalizeVocabulary(defaultVocabulary);
        const pageCount = Math.ceil(normalizedVocab.length / ITEMS_PER_PAGE);
        const vocabDuration = pageCount * FRAMES_PER_PAGE;
        const total = audioDurationFrames + vocabDuration;
        setDurationInFrames(total);
        console.log(`Audio: ${seconds.toFixed(2)}s → ${audioDurationFrames} frames | Vocab: ${vocabDuration} frames | Total: ${total} frames`);
      })
      .catch((err: unknown) => {
        console.warn('No se pudo leer la duración del audio, fallback 60s:', err);
        setCaptions(ragCaptions as Captions);
        const audioDurationFrames = 60 * FPS + AUDIO_BUFFER_FRAMES;
        const normalizedVocab = normalizeVocabulary(defaultVocabulary);
        const pageCount = Math.ceil(normalizedVocab.length / ITEMS_PER_PAGE);
        setDurationInFrames(audioDurationFrames + pageCount * FRAMES_PER_PAGE);
      });
  }, []);

  return (
    <div className="App">
      <Player
        style={{ width: "100%", aspectRatio: "16/9" }}
        component={PodcastVideo as any}
        durationInFrames={durationInFrames}
        fps={FPS}
        compositionWidth={1920}
        compositionHeight={1080}
        controls
        inputProps={{
          audioUrl: PREVIEW_AUDIO,
          imageUrl: PREVIEW_IMAGE,
          vocabulary: defaultVocabulary,
          title: 'Mastering RAG: The Architecture for 2025',
          level: 'advanced' as EpisodeLevel,
          format: 'solo' as EpisodeFormat,
          captions: captions,
        }}
      />
    </div>
  );
}
