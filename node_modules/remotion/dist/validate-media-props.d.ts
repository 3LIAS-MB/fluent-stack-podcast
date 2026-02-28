import type { RemotionAudioProps } from './audio';
import type { RemotionVideoProps } from './video';
import type { OffthreadVideoProps } from './video/props';
export declare const validateMediaProps: (props: RemotionVideoProps | RemotionAudioProps | OffthreadVideoProps, component: 'Video' | 'Audio') => void;
