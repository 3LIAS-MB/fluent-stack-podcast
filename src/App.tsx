import { Player } from "@remotion/player";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import React, { useEffect, useState } from "react";
import "./styles.css";
import { PodcastVideo } from "./compositions/PodcastVideo";
import { Captions, VocabularyItem, EpisodeLevel, EpisodeFormat } from "./types";
import ragCaptions from "./data/rag-captions.json";

// ── Audio de preview ─────────────────────────────────────────────────────────
const PREVIEW_AUDIO = 'ElevenLabs1.mp3';
const PREVIEW_IMAGE = 'img/solo/background.jpg';

// Preview vocabulary — 5 items por categoría (20 total = 2 páginas) para demo completa
const defaultVocabulary: VocabularyItem[] = [
  // Technical Terms
  { term: 'RAG', definition: 'Retrieval Augmented Generation - grounding LLMs in external data', category: 'Technical Terms' },
  { term: 'LLM', definition: 'Large Language Model - A model trained on massive amounts of text', category: 'Technical Terms' },
  { term: 'Embedding', definition: 'Converting text into numerical vectors that capture meaning', category: 'Technical Terms' },
  { term: 'Vector Database', definition: 'Database specialized in storing and searching mathematical vectors', category: 'Technical Terms' },
  { term: 'Context Window', definition: 'The maximum amount of text an LLM can process at once', category: 'Technical Terms' },
  // Concepts
  { term: 'Hallucination', definition: 'When an AI providing false information with confidence', category: 'Concepts' },
  { term: 'Semantic Search', definition: 'Searching based on meaning rather than just keyword matching', category: 'Concepts' },
  { term: 'Chunking', definition: 'Breaking large documents into smaller semantic pieces', category: 'Concepts' },
  { term: 'Re-ranking', definition: 'Refining the relevance of retrieved information chunks', category: 'Concepts' },
  { term: 'Hybrid Search', definition: 'Combining vector similarity with traditional keyword search', category: 'Concepts' },
  // Tools & Implementation
  { term: 'Attribution', definition: 'Citing specific sources for information provided by an AI', category: 'Implementation' },
  { term: 'Cosine Similarity', definition: 'A metric used to measure how similar two vectors are', category: 'Implementation' },
  { term: 'Vector Store', definition: 'A system for managing and querying document embeddings', category: 'Implementation' },
  { term: 'Pinecone', definition: 'A popular managed vector database service', category: 'Implementation' },
  { term: 'Prompt Engineering', definition: 'Crafting inputs to get the best results from an LLM', category: 'Implementation' },
];

const FPS = 30;
const AUDIO_BUFFER_FRAMES = 15;
const ITEMS_PER_PAGE = 15;
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
        const pageCount = Math.ceil(defaultVocabulary.length / ITEMS_PER_PAGE);
        const vocabDuration = pageCount * FRAMES_PER_PAGE;
        const total = audioDurationFrames + vocabDuration;
        setDurationInFrames(total);
        console.log(`Audio: ${seconds.toFixed(2)}s → ${audioDurationFrames} frames | Vocab: ${vocabDuration} frames | Total: ${total} frames`);
      })
      .catch((err: unknown) => {
        console.warn('No se pudo leer la duración del audio, fallback 60s:', err);
        setCaptions(ragCaptions as Captions);
        const audioDurationFrames = 60 * FPS + AUDIO_BUFFER_FRAMES;
        const pageCount = Math.ceil(defaultVocabulary.length / ITEMS_PER_PAGE);
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
