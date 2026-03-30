import { Player } from "@remotion/player";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import React, { useEffect, useState } from "react";
import "./styles.css";
import { MAIN_FONT } from "./utils/fonts";
import { PodcastVideo } from "./compositions/PodcastVideo";
import { normalizeVocabulary } from "./utils/vocabNormalization";
import { Captions } from "./types";
import { SHARED_AUDIO_URL, SHARED_IMAGE_URL, SHARED_TITLE, SHARED_LEVEL, SHARED_FORMAT, SHARED_CAPTIONS, SHARED_VOCABULARY } from "./data/preview-data";



const FPS = 30;
const AUDIO_BUFFER_FRAMES = 15;
const ITEMS_PER_PAGE = 8;
const FRAMES_PER_PAGE = 150; // 5s × 30fps



export default function App() {
  const [durationInFrames, setDurationInFrames] = useState<number>(600);
  const [captions, setCaptions] = useState<Captions>({
    words: [{ word: 'Loading', start: 0, end: 1.0, speaker: 'Host' as const }],
  });

  useEffect(() => {
    getAudioDurationInSeconds(SHARED_AUDIO_URL)
      .then((seconds) => {
        setCaptions(SHARED_CAPTIONS);

        // Duración total = audioDurationFrames + vocabRecapDuration
        const audioDurationFrames = Math.ceil(seconds * FPS) + AUDIO_BUFFER_FRAMES;
        const normalizedVocab = normalizeVocabulary(SHARED_VOCABULARY);
        const pageCount = Math.ceil(normalizedVocab.length / ITEMS_PER_PAGE);
        const vocabDuration = pageCount * FRAMES_PER_PAGE;
        const total = audioDurationFrames + vocabDuration;
        setDurationInFrames(total);
        console.log(`Audio: ${seconds.toFixed(2)}s → ${audioDurationFrames} frames | Vocab: ${vocabDuration} frames | Total: ${total} frames`);
      })
      .catch((err: unknown) => {
        console.warn('No se pudo leer la duración del audio, fallback 60s:', err);
        setCaptions(SHARED_CAPTIONS);
        const audioDurationFrames = 60 * FPS + AUDIO_BUFFER_FRAMES;
        const normalizedVocab = normalizeVocabulary(SHARED_VOCABULARY);
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
          audioUrl: SHARED_AUDIO_URL,
          imageUrl: SHARED_IMAGE_URL,
          vocabulary: SHARED_VOCABULARY,
          title: SHARED_TITLE,
          level: SHARED_LEVEL,
          format: SHARED_FORMAT,
          captions: captions,
        }}
      />
    </div>
  );
}
