import { z } from 'zod';

const PodcastVideoSchema = z.object({
  audioUrl: z.string(),
  imageUrl: z.string(),
  vocabulary: z.any(),
  title: z.string(),
  level: z.enum([
    'beginner', 'intermediate', 'advanced',
    'Beginner A1-A2', 'Intermediate B1-B2', 'Advanced C1-C2'
  ]),
  format: z.enum(['solo', 'duo']),
  captions: z.object({
    words: z.array(z.object({
      word: z.string(),
      start: z.number(),
      end: z.number(),
      speaker: z.string(),
    })),
  }),
});

const inputProps = {
  "audioUrl": "http://localhost:3000/temp/temp-audio-1775178821811.mp3",
  "imageUrl": "http://localhost:3000/temp/temp-image-1775178821833.jpg",
  "vocabulary": "[]",
  "title": "Prompt Engineering Basics: Getting Better Answers from LLMs (16x9)",
  "level": "Intermediate B1-B2",
  "format": "solo",
  "captions": {
    "words": [
      {
        "word": "Welcome",
        "start": 0,
        "end": 0.5,
        "speaker": "Ryan"
      }
    ]
  }
};

try {
  PodcastVideoSchema.parse(inputProps);
  console.log("Validación exitosa!");
} catch (e) {
  console.log("Error de validación:");
  console.log(e);
}
