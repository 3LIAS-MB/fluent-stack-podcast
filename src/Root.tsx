import React from 'react';
import {
  Composition,
  registerRoot,
  staticFile
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Outfit';
import { z } from 'zod';

const { fontFamily } = loadFont();
import { PodcastVideo } from './compositions/PodcastVideo';
// import { PodcastVideoShort } from './compositions/PodcastVideoShort'; // desactivada por ahora
import {
  EpisodeLevel,
  EpisodeFormat,
  Captions,
  VocabularyItem,
} from './types';

const defaultCaptions: Captions = {
  words: [
    { word: 'Welcome', start: 0, end: 0.5, speaker: 'Host' as const },
    { word: 'to', start: 0.5, end: 0.7, speaker: 'Host' as const },
    { word: 'Fluent', start: 0.7, end: 1.0, speaker: 'Host' as const },
    { word: 'Stack', start: 1.0, end: 1.3, speaker: 'Host' as const },
    { word: 'Podcast', start: 1.3, end: 1.8, speaker: 'Host' as const },
    { word: 'Today', start: 2.0, end: 2.4, speaker: 'Host' as const },
    { word: "we're", start: 2.4, end: 2.7, speaker: 'Host' as const },
    { word: 'talking', start: 2.7, end: 3.1, speaker: 'Host' as const },
    { word: 'about', start: 3.1, end: 3.5, speaker: 'Host' as const },
    { word: 'APIs', start: 3.5, end: 4.0, speaker: 'Host' as const },
    { word: 'and', start: 4.0, end: 4.3, speaker: 'Host' as const },
    { word: 'how', start: 4.3, end: 4.6, speaker: 'Host' as const },
    { word: 'they', start: 4.6, end: 4.8, speaker: 'Host' as const },
    { word: 'power', start: 4.8, end: 5.2, speaker: 'Host' as const },
    { word: 'modern', start: 5.2, end: 5.7, speaker: 'Host' as const },
    { word: 'software', start: 5.7, end: 6.2, speaker: 'Host' as const },
    { word: 'Let', start: 6.4, end: 6.6, speaker: 'Host' as const },
    { word: 'us', start: 6.6, end: 6.8, speaker: 'Host' as const },
    { word: 'dive', start: 6.8, end: 7.1, speaker: 'Host' as const },
    { word: 'in', start: 7.1, end: 7.3, speaker: 'Host' as const },
    { word: 'and', start: 7.3, end: 7.5, speaker: 'Host' as const },
    { word: 'explore', start: 7.5, end: 8.0, speaker: 'Host' as const },
    { word: 'REST', start: 8.0, end: 8.4, speaker: 'Host' as const },
    { word: 'GraphQL', start: 8.4, end: 9.0, speaker: 'Host' as const },
    { word: 'and', start: 9.0, end: 9.2, speaker: 'Host' as const },
    { word: 'beyond', start: 9.2, end: 9.8, speaker: 'Host' as const },
  ],
};

// Preview vocabulary — 5 items por categoría (20 total = 2 páginas)
const defaultVocabulary: any[] = [
  {
    category: "Technical Terms",
    items: [
      { 
        term: 'Pull request', 
        phonetic: '/ˈpʊl rɪˌkwɛst/',
        english: 'Propose changes to a codebase for review', 
        español: 'Proponer cambios a una base de código para su revisión', 
        example: 'I submitted a pull request to fix the authentication bug.'
      },
      { 
        term: 'Merge conflict', 
        phonetic: '/ˈmɜrdʒ ˈkɑnflɪkt/',
        english: 'Incompatible changes in two branches of code', 
        español: 'Cambios incompatibles en dos ramas de código', 
        example: 'We cannot deploy yet because there is a massive merge conflict.'
      },
      { 
        term: 'Refactor', 
        phonetic: '/riˈfæktər/',
        english: 'Restructure code without changing its behavior', 
        español: 'Reestructurar el código sin cambiar su comportamiento', 
        example: 'We need to refactor this logic to improve performance.' 
      },
      { 
        term: 'Deploy', 
        phonetic: '/dɪˈplɔɪ/',
        english: 'Release code to a production environment', 
        español: 'Lanzar código a un entorno de producción', 
        example: 'We deploy to production every Friday morning.'
      },
      { 
        term: 'Debug', 
        phonetic: '/diˈbʌɡ/',
        english: 'Find and fix errors in code', 
        español: 'Encontrar y corregir errores en el código',
        example: 'I spent four hours trying to debug this elusive memory leak.'
      }
    ]
  },
  {
    category: "Phrasal Verbs",
    items: [
      { 
        term: 'Run into', 
        phonetic: '/ˈrʌn ˈɪntu/',
        english: 'To encounter a problem unexpectedly', 
        español: 'Encontrarse con un problema inesperadamente', 
        example: 'I ran into a weird bug yesterday while testing the API.' 
      },
      { 
        term: 'Figure out', 
        phonetic: '/ˈfɪɡjər ˈaʊt/',
        english: 'To understand or solve something', 
        español: 'Entender o resolver algo',
        example: 'It took me a while to figure out how the database schema works.'
      },
      { 
        term: 'Break down', 
        phonetic: '/ˈbreɪk ˈdaʊn/',
        english: 'To stop working or to analyze in detail', 
        español: 'Dejar de funcionar o analizar en detalle',
        example: 'Let me break down this complex architecture for you.'
      },
      { 
        term: 'Set up', 
        phonetic: '/ˈsɛt ˈʌp/',
        english: 'To configure or prepare something for use', 
        español: 'Configurar o preparar algo para su uso',
        example: 'I need to set up my local development environment.'
      },
      { 
        term: 'Roll back', 
        phonetic: '/ˈroʊl ˈbæk/',
        english: 'To revert to a previous stable version', 
        español: 'Volver a una versión estable anterior',
        example: 'The new release crashed, so we had to roll back immediately.'
      }
    ]
  },
  {
    category: "Collocation",
    items: [
      { 
        term: 'At the end of the day', 
        phonetic: '/ət ði ˈɛnd əv ðə ˈdeɪ/',
        english: 'Ultimately; when everything is considered', 
        español: 'Al fin y al cabo; cuando todo se considera',
        example: 'At the end of the day, user experience matters more than clean code.'
      },
      { 
        term: 'On the same page', 
        phonetic: '/ɑn ðə ˈseɪm ˈpeɪdʒ/',
        english: 'Having the same understanding or goal', 
        español: 'Tener el mismo entendimiento u objetivo', 
        example: 'Let us have a quick meeting to make sure we are all on the same page.' 
      },
      { 
        term: 'Under the hood', 
        phonetic: '/ˈʌndər ðə ˈhʊd/',
        english: 'Internal workings behind the interface', 
        español: 'Funcionamiento interno detrás de la interfaz', 
        example: 'The UI is simple, but under the hood, it uses a complex graph database.'
      },
      { 
        term: 'Ship a feature', 
        phonetic: '/ˈʃɪp ə ˈfitʃər/',
        english: 'Release a new capability to users', 
        español: 'Lanzar una nueva función para los usuarios',
        example: 'We are planning to ship this feature by the end of Q3.'
      },
      { 
        term: 'Handle edge cases', 
        phonetic: '/ˈhændl ˈɛdʒ ˌkeɪsɪz/',
        english: 'Deal with unusual or extreme scenarios', 
        español: 'Lidiar con escenarios inusuales o extremos',
        example: 'Writing tests helps ensure we handle all potential edge cases.'
      }
    ]
  },
  {
    category: "Interview Expressions",
    items: [
      { 
        term: 'Walk me through', 
        phonetic: '/ˈwɔk mi ˌθru/',
        english: 'Explain step by step how you did something', 
        español: 'Explicar paso a paso cómo hiciste algo',
        example: 'Could you walk me through your decision to use React here?'
      },
      { 
        term: 'Talk me through', 
        phonetic: '/ˈtɔk mi ˌθru/',
        english: 'Please explain this to me in detail', 
        español: 'Por favor, explícame esto en detalle',
        example: 'Talk me through the steps you took to optimize the database query.'
      },
      { 
        term: 'How would you approach', 
        phonetic: '/haʊ wʊd ju əˈproʊtʃ/',
        english: 'What is your strategy for solving this?', 
        español: '¿Cuál es tu estrategia para resolver esto?',
        example: 'How would you approach handling millions of concurrent requests?'
      },
      { 
        term: 'In my experience', 
        phonetic: '/ɪn maɪ ɪkˈspɪriəns/',
        english: 'Based on what I have seen or done before', 
        español: 'Según lo que he visto o hecho antes',
        example: 'In my experience, microservices add unnecessary overhead to small projects.'
      },
      { 
        term: 'The trade-off is', 
        phonetic: '/ðə ˈtreɪdˌɑf ɪz/',
        english: 'The compromise between two options is...', 
        español: 'El compromiso entre dos opciones es...',
        example: 'The trade-off is that caching improves speed but uses more memory.'
      }
    ]
  }
];

const PodcastVideoSchema = z.object({
  audioUrl: z.string(),
  imageUrl: z.string(),
  vocabulary: z.array(z.object({
    term: z.string(),
    definition: z.string(),
    example: z.string().optional(),
    category: z.string().optional(),
  })),
  title: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  format: z.enum(['solo', 'duo']),
  captions: z.object({
    words: z.array(z.object({
      word: z.string(),
      start: z.number(),
      end: z.number(),
      speaker: z.enum(['Host', 'Alex', 'Sam']),
    })),
  }),
});

// RemotionRoot es el componente raíz: debe devolver JSX con <Composition />
const RemotionRoot: React.FC = () => {
  // Calculamos los frames del audio de preview dinámicamente para que si cambia
  // defaultCaptions, el Studio no quede cortado ni con frames vacíos.
  const lastWord = defaultCaptions.words[defaultCaptions.words.length - 1];
  const previewAudioFrames = Math.ceil(lastWord.end * 30) + 15; // +15 buffer
  const TOTAL_FRAMES = previewAudioFrames + 2 * 150; // 2 páginas × 150 frames (5s)
  return (
    <>
      <Composition
        id="PodcastVideo"
        component={PodcastVideo as any}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        schema={PodcastVideoSchema}
        defaultProps={{
          audioUrl: staticFile('ElevenLabs2.mp3'),
          imageUrl: staticFile('background.jpg'),
          vocabulary: defaultVocabulary,
          title: 'API Design Patterns: REST, GraphQL & Beyond',
          level: 'intermediate' as EpisodeLevel,
          format: 'solo' as EpisodeFormat,
          captions: defaultCaptions,
        }}
      />
      {/* <Composition
        id="PodcastVideoShort"
        component={PodcastVideoShort as any}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        schema={PodcastVideoSchema}
        defaultProps={{
          audioUrl: staticFile('ElevenLabs2.mp3'),
          imageUrl: staticFile('background3.jpg'),
          vocabulary: defaultVocabulary,
          title: 'API Design Patterns: REST, GraphQL & Beyond',
          level: 'intermediate' as EpisodeLevel,
          format: 'solo' as EpisodeFormat,
          captions: defaultCaptions,
        }}
      /> */}
    </>
  );
};

// registerRoot recibe el componente raíz (RemotionRoot), no el video directamente
registerRoot(RemotionRoot);
