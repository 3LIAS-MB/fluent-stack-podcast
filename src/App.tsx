import { Player } from "@remotion/player";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import React, { useEffect, useState } from "react";
import "./styles.css";
import { PodcastVideo } from "./compositions/PodcastVideo";
import { Captions, VocabularyItem, EpisodeLevel, EpisodeFormat } from "./types";

// ── Audio de preview ─────────────────────────────────────────────────────────
const PREVIEW_AUDIO = 'ElevenLabs2.mp3';
const PREVIEW_IMAGE = 'background.jpg';

const defaultVocabulary: VocabularyItem[] = [
  { term: 'API', definition: 'Application Programming Interface - a way for programs to talk to each other' },
  { term: 'Endpoint', definition: 'A specific URL where an API can be accessed' },
  { term: 'Request', definition: 'When a client asks the server for data' },
];

// Captions placeholder — solo para el preview visual en 5173.
// El karaoke real lo genera el server via transcripción Whisper.
const placeholderCaptions: Captions = {
  words: [
    { word: 'Preview', start: 0, end: 0.5, speaker: 'Host' as const },
    { word: 'mode', start: 0.6, end: 1.0, speaker: 'Host' as const },
  ],
};

const FPS = 30;
const VOCAB_RECAP_DURATION = 180; // 6 segundos

export default function App() {
  // Empieza en 300 frames y se actualiza con la duración real del audio
  const [durationInFrames, setDurationInFrames] = useState<number>(300);

  useEffect(() => {
    getAudioDurationInSeconds(PREVIEW_AUDIO)
      .then((seconds) => {
        // Igual que PodcastVideo.tsx: duración audio + 180 frames vocab
        const frames = Math.ceil(seconds * FPS) + VOCAB_RECAP_DURATION;
        setDurationInFrames(frames);
        console.log(`Audio real: ${seconds.toFixed(2)}s → ${frames} frames (${(frames / FPS).toFixed(1)}s total)`);
      })
      .catch((err) => {
        console.warn('No se pudo leer la duración del audio, fallback 60s:', err);
        setDurationInFrames(60 * FPS + VOCAB_RECAP_DURATION);
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
          title: 'Sample Episode',
          level: 'intermediate' as EpisodeLevel,
          format: 'solo' as EpisodeFormat,
          captions: placeholderCaptions,
        }}
      />
    </div>
  );
}
