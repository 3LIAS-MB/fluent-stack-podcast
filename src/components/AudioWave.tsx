import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { BarsVisualization } from '../visualizations/BarsVisualization';
import { HillsVisualization } from '../visualizations/HillsVisualization';
import { RadialBarsVisualization } from '../visualizations/RadialBarsVisualization';
import { WaveVisualization } from '../visualizations/WaveVisualization';

export type AudioWaveVariant =
  | 'stoic'
  | 'bars-1'
  | 'bars-2'
  | 'bars-3'
  | 'bars-under'
  | 'wave-1'
  | 'wave-2';

interface AudioWaveProps {
  audioSrc: string;
  heightPercent?: number;
  color?: string;
  variant?: AudioWaveVariant;
}

export const AudioWave: React.FC<AudioWaveProps> = ({
  audioSrc,
  heightPercent = 8,
  color = 'white',
  variant = 'stoic', // Cambia este valor por defecto para probar otros estilos
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const audioData = useAudioData(audioSrc);

  if (!audioData) {
    return null;
  }

  const barHeight = (height * heightPercent) / 100;
  // const nSamples = 512;
  // const iterations = 12
  const nSamples = 256;   // 256 suficiente a 50% canvas; 512 duplica coste sin ganancia visual
  const iterations = 7;  // ventana de decay; >7 frames es imperceptible
  const decayFactor = 0.82; // Qué tanto "cae" la onda en cada frame

  // ── Cálculo de Envolvente Suavizada (Attack Instantáneo / Decay Lento) ──

  // Creamos un array para guardar el pico máximo con decaimiento
  const smoothedData = new Float32Array(nSamples).fill(0);

  // Miramos 'iterations' frames hacia atrás
  for (let j = 0; j < iterations; j++) {
    const f = frame - j;
    if (f < 0) break;

    const values = visualizeAudio({
      audioData,
      fps,
      frame: f,
      numberOfSamples: nSamples,
    });

    const decay = Math.pow(decayFactor, j);
    for (let i = 0; i < nSamples; i++) {
      // Si el valor pasado (con decaimiento) es mayor al actual, lo mantenemos
      if (values[i] * decay > smoothedData[i]) {
        smoothedData[i] = values[i] * decay;
      }
    }
  }

  // // Filtramos los sub-graves (los primeros 5 bins) que suelen estar saturados
  // // y aplicamos una curva de ecualización visual (potenciamos agudos, atenuamos graves)
  // const frequencyData = Array.from(smoothedData.slice(5, nSamples * 0.7))
  //   .map((v, i, arr) => {
  //     // Curva de ganancia: de 0.7 en graves a 1.2 en agudos
  //     const ratio = i / arr.length;
  //     const gain = 0.7 + (ratio * 0.5);
  //     return v * gain;
  //   });

  // Convertimos a array normal y aplicamos el recorte de frecuencias altas (70%)
  const frequencyData = Array.from(smoothedData.slice(0, nSamples * 0.7));

  // ── RENDERIZADO POR VARIANTE ──────────────────────────────────────────────

  const renderVisualization = () => {
    switch (variant) {
      case 'stoic':
        return (
          <BarsVisualization
            frequencyData={frequencyData}
            width={width * 0.5}
            height={barHeight}       // Altura estándar del contenedor
            lineThickness={2}       // Más fino para más detalle
            gapSize={3}             // Espaciado elegante
            roundness={1.5}         // Estética tech moderna
            color={color}
            maxAmplitude={0.7}      // Llenado con un poco de clipping sutil
            maxDb={-25}
            minDb={-65}
          />
        );

      case 'bars-1': // Basado en el estilo "Pink" de AllVisualizations
        return (
          <BarsVisualization
            frequencyData={frequencyData}
            width={width * 0.5}
            height={barHeight}
            lineThickness={5}
            gapSize={7}
            roundness={2}
            color={color}
          />
        );

      case 'bars-2': // Basado en el estilo "Brown" de AllVisualizations
        return (
          <BarsVisualization
            frequencyData={frequencyData}
            width={width * 0.5}
            height={barHeight}
            lineThickness={7}
            gapSize={6}
            roundness={4}
            color={color}
          />
        );

      case 'bars-3': // Basado en el estilo "Purple" de AllVisualizations
        return (
          <BarsVisualization
            frequencyData={frequencyData}
            width={width * 0.5}
            height={barHeight}
            lineThickness={2}
            gapSize={4}
            roundness={2}
            color={color}
          />
        );

      case 'bars-under': // Basado en el estilo "Blue Under" de AllVisualizations
        return (
          <BarsVisualization
            frequencyData={frequencyData}
            width={width * 0.5}
            height={barHeight}
            lineThickness={6}
            gapSize={7}
            roundness={2}
            color={color}
            placement="under"
          />
        );

      case 'wave-1': // Basado en WaveTealRed (pero con el color del podcast)
        return (
          <WaveVisualization
            frequencyData={frequencyData}
            width={width * 0.5}
            height={barHeight * 2}
            offsetPixelSpeed={200}
            lineColor={[color, `${color}88`]}
            lineGap={(2 * (width * 0.5 / 2)) / 8}
            topRoundness={0.2}
            bottomRoundness={0.4}
            sections={8}
          />
        );

      case 'wave-2': // Basado en WaveRed (6 líneas)
        return (
          <WaveVisualization
            frequencyData={frequencyData}
            width={width * 0.5}
            height={barHeight * 2}
            lineColor={color}
            lines={6}
            lineGap={6}
            sections={10}
            offsetPixelSpeed={-100}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '52%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '50%',
        height: barHeight,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        filter: `drop-shadow(0 0 8px ${color}44)`,
        // filter: `drop-shadow(0 0 12px ${color}88) drop-shadow(0 0 4px ${color}55)`,
      }}
    >
      {renderVisualization()}
    </div>
  );
};
