import { Player } from "@remotion/player";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import React, { useEffect, useState } from "react";
import "./styles.css";
import { PodcastVideo } from "./compositions/PodcastVideo";
import { Captions, VocabularyItem, EpisodeLevel, EpisodeFormat } from "./types";

// ── Audio de preview ─────────────────────────────────────────────────────────
const PREVIEW_AUDIO = 'ElevenLabs2.mp3';
const PREVIEW_IMAGE = 'background.jpg';

// Preview vocabulary — 5 items por categoría (20 total = 2 páginas) para demo completa
const defaultVocabulary: VocabularyItem[] = [
  // Technical Terms
  { term: 'Pull request', definition: 'Propose changes to a codebase for review', category: 'Technical Terms' },
  { term: 'Merge conflict', definition: 'Incompatible changes in two branches of code', category: 'Technical Terms' },
  { term: 'Refactor', definition: 'Restructure code without changing its behavior', category: 'Technical Terms' },
  { term: 'Deploy', definition: 'Release code to a production environment', category: 'Technical Terms' },
  { term: 'Debug', definition: 'Find and fix errors in code', category: 'Technical Terms' },
  // Phrasal Verbs
  { term: 'Run into', definition: 'To encounter a problem unexpectedly', category: 'Phrasal Verbs' },
  { term: 'Figure out', definition: 'To understand or solve something', category: 'Phrasal Verbs' },
  { term: 'Break down', definition: 'To stop working or to analyze in detail', category: 'Phrasal Verbs' },
  { term: 'Set up', definition: 'To configure or prepare something for use', category: 'Phrasal Verbs' },
  { term: 'Roll back', definition: 'To revert to a previous stable version', category: 'Phrasal Verbs' },
  // Collocation
  { term: 'At the end of the day', definition: 'Ultimately; when everything is considered', category: 'Collocation' },
  { term: 'On the same page', definition: 'Having the same understanding or goal', category: 'Collocation' },
  { term: 'Under the hood', definition: 'Internal workings behind the interface', category: 'Collocation' },
  { term: 'Ship a feature', definition: 'Release a new capability to users', category: 'Collocation' },
  { term: 'Handle edge cases', definition: 'Deal with unusual or extreme scenarios', category: 'Collocation' },
  // Interview Expressions
  { term: 'Walk me through', definition: 'Explain step by step how you did something', category: 'Interview Expressions' },
  { term: 'Talk me through', definition: 'Please explain this to me in detail', category: 'Interview Expressions' },
  { term: 'How would you approach', definition: 'What is your strategy for solving this?', category: 'Interview Expressions' },
  { term: 'In my experience', definition: 'Based on what I have seen or done before', category: 'Interview Expressions' },
  { term: 'The trade-off is', definition: 'The compromise between two options is...', category: 'Interview Expressions' },
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
        // Captions distribuidas a lo largo del audio para simular el comportamiento real
        setCaptions(generatePreviewCaptions(seconds));

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
          title: 'API Design Patterns: REST, GraphQL & Beyond',
          level: 'intermediate' as EpisodeLevel,
          format: 'solo' as EpisodeFormat,
          captions: captions,
        }}
      />
    </div>
  );
}
