export type EpisodeLevel = 'beginner' | 'intermediate' | 'advanced';
export type EpisodeFormat = 'solo' | 'duo';
export type OutputFormat = '16:9' | '9:16';
export type TranscriptionMethod = 'openai' | 'local';
export type Speaker = 'Ryan' | 'Ethan' | 'Katherine';

export interface ScriptSegment {
  speaker: Speaker;
  text: string;
}

export interface Word {
  word: string;
  start: number;
  end: number;
  speaker: Speaker;
}

export interface Captions {
  words: Word[];
}

export interface VocabularyItem {
  term: string;
  definition: string;
  example?: string;
  category?: string;  // e.g. "Phrasal Verbs", "Technical Terms", "Interview Expressions", "Collocation"
}

export interface RenderRequest {
  audioUrl: string;
  imageUrl: string;
  vocabulary: VocabularyItem[];
  title: string;
  level: EpisodeLevel;
  format: EpisodeFormat;
  outputFormat: OutputFormat;
  transcriptionMethod?: TranscriptionMethod;
  scriptSegments?: ScriptSegment[] | string; // JSON string or parsed array from n8n
}

export interface RenderResponse {
  success: boolean;
  status: 'success' | 'error';
  downloadUrl?: string;
  fileName?: string;
  outputPath?: string;
  error?: string;
}

export interface TranscriptionResult {
  captions: Captions;
  audioFile: string;
}

export interface DownloadedFile {
  path: string;
  suffix: string;
}

export interface RenderOptions {
  data: RenderRequest;
  captions: Captions;
  localAudioFile: string;
  localImageFile: string;
}
