export type EpisodeLevel = 'beginner' | 'intermediate' | 'advanced';
export type EpisodeFormat = 'solo' | 'duo';
export type OutputFormat = '16:9' | '9:16';

export interface Word {
  word: string;
  start: number;
  end: number;
  speaker: 'Host' | 'Alex' | 'Sam';
}

export interface Captions {
  words: Word[];
}

export interface SubtitleBlock {
  words: Word[];
  start: number; // tiempo de inicio del bloque (start de la primera palabra)
  end: number;   // tiempo de fin del bloque (end de la última palabra)
}

export interface VocabularyItem {
  term: string;
  definition: string;
  english?: string;
  español?: string;
  phonetic?: string;
  example?: string;
  category?: string;  // e.g. "Phrasal Verbs", "Technical Terms", "Interview Expressions", "Collocation"
}

export interface VocabularyCategory {
  category: string;
  items: Partial<VocabularyItem>[];
}

export type VocabularyInput = VocabularyItem[] | VocabularyCategory[] | any;

export interface EpisodeData {
  audioUrl: string;
  imageUrl: string;
  vocabulary: VocabularyInput;
  title: string;
  level: EpisodeLevel;
  format: EpisodeFormat;
  outputFormat: OutputFormat;
}

export interface RenderRequest {
  audioUrl: string;
  imageUrl: string;
  vocabulary: VocabularyInput;
  title: string;
  level: EpisodeLevel;
  format: EpisodeFormat;
  outputFormat: OutputFormat;
}

export interface RenderResponse {
  status: 'success' | 'error';
  outputPath?: string;
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
