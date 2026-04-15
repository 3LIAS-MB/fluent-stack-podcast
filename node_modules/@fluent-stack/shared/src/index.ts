export type EpisodeLevel = 'beginner' | 'intermediate' | 'advanced' | 'Beginner A1-A2' | 'Intermediate B1-B2' | 'Advanced C1-C2';
export type EpisodeFormat = 'solo' | 'duo';
export type OutputFormat = '16:9' | '9:16';
export type TranscriptionMethod = 'openai' | 'local';
export type Speaker = 'Ryan' | 'Ethan' | 'Katherine' | 'Alex' | 'Sam' | 'Host' | string;

export interface Word {
  word: string;
  start: number;
  end: number;
  speaker: Speaker;
}

export interface Captions {
  words: Word[];
}

export interface SubtitleBlock {
  words: Word[];
  start: number;
  end: number;
}

export interface VocabularyItem {
  term: string;
  definition: string;
  english?: string;
  español?: string;
  phonetic?: string;
  example?: string;
  category?: string;
}

export interface VocabularyCategory {
  category: string;
  items: Partial<VocabularyItem>[];
}

export type VocabularyInput = VocabularyItem[] | VocabularyCategory[] | any;

export interface RenderRequest {
  audioUrl: string;
  imageUrl: string;
  vocabulary: VocabularyInput;
  title: string;
  level: EpisodeLevel;
  format: EpisodeFormat;
  outputFormat: OutputFormat;
  transcriptionMethod?: TranscriptionMethod;
  scriptSegments?: any; // Segments for duo format
}

export interface RenderResponse {
  status: 'success' | 'error';
  success?: boolean;
  outputPath?: string;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}

export interface CompositionProps {
  audioUrl: string;
  imageUrl: string;
  vocabulary: VocabularyInput;
  title: string;
  level: EpisodeLevel;
  format: EpisodeFormat;
  captions: Captions;
}

export interface TranscriptionResult {
  captions: Captions;
  audioFile: string;
}

export interface RenderOptions {
  data: RenderRequest;
  captions: Captions;
  localAudioFile: string;
  localImageFile: string;
}

export interface DownloadedFile {
  path: string;
  suffix: string;
}

// ── Vocab Utilities ─────────────────────────────────────────────────────────
export { normalizeVocabulary } from './vocabNormalization';
export { paginateVocabulary } from './vocabPagination';
export type { VocabRow } from './vocabPagination';
