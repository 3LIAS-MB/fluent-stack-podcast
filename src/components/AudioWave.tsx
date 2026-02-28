import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { BarsVisualization } from '../visualizations/BarsVisualization';
import { HillsVisualization } from '../visualizations/HillsVisualization';
import { RadialBarsVisualization } from '../visualizations/RadialBarsVisualization';
import { WaveVisualization } from '../visualizations/WaveVisualization';

interface AudioWaveProps {
  audioSrc: string;
  heightPercent?: number;
  color?: string;
}

export const AudioWave: React.FC<AudioWaveProps> = ({
  audioSrc,
  heightPercent = 8,
  color = 'white',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const audioData = useAudioData(audioSrc);

  if (!audioData) {
    return null;
  }

  const barHeight = (height * heightPercent) / 100;
  const nSamples = 512;

  const visualizationValues = visualizeAudio({
    audioData,
    fps,
    frame,
    numberOfSamples: nSamples,
  });

  const frequencyData = visualizationValues.slice(0, nSamples * 0.7);

  return (
    <>
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
          // background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
        }}
      >
        {/* ── VISUALIZACIÓN ACTIVA ─────────────────────────────────────────── */}

        {/* 1. BarsVisualization – barras verticales clásicas */}
        <BarsVisualization
          frequencyData={frequencyData}
          width={width * 0.5}
          height={barHeight * 0.8}
          lineThickness={5}
          gapSize={7}
          roundness={3}
          color={color}
          maxDb={-20}
          minDb={-80}
        />

        {/* ── VISUALIZACIONES ALTERNATIVAS (comentadas) ────────────────────── */}

        {/* 2. HillsVisualization – colinas suaves basadas en SVG bezier
        <HillsVisualization
          frequencyData={frequencyData}
          width={width * 0.55}   // coincide con el 55% del contenedor padre
          height={barHeight}
          strokeColor={color}    // color del trazo (string o array de colores)
          fillColor="none"       // relleno de las colinas ('none' = solo trazo)
          strokeWidth={2}
          copies={2}             // número de capas/copias desplazadas
          blendMode="normal"     // mixBlendMode CSS ('screen', 'overlay', etc.)
          maxDb={-20}
          minDb={-80}
        /> */}

        {/* 3. RadialBarsVisualization – barras radiales en círculo
        <RadialBarsVisualization
          frequencyData={frequencyData}
          diameter={barHeight * 2}   // diámetro total del círculo
          innerRadius={barHeight * 0.4} // radio del hueco interior
          lineThickness={3}
          gapSize={2}
          roundness={2}
          barOrigin="inner"      // 'inner' | 'outer' | 'middle'
          color={color}
          maxDb={-20}
          minDb={-80}
        /> */}

        {/* 4. WaveVisualization – onda sinusoidal animada */}
        {/* <WaveVisualization
          frequencyData={frequencyData}
          width={width * 0.55}   // coincide con el 55% del contenedor padre
          height={barHeight}
          sections={12}          // número de secciones de la onda
          lines={2}              // número de líneas superpuestas
          lineGap={20}           // separación entre líneas (px)
          lineColor={[color, `${color}88`]} // array de colores (se repiten)
          lineThickness={2}
          topRoundness={0.4}     // redondez de los picos (0-1)
          bottomRoundness={0.4}  // redondez de los valles (0-1)
          offsetPixelSpeed={-200} // velocidad de desplazamiento en px/s
          maxDb={-20}
          minDb={-80}
        /> */}

      </div>
    </>
  );
};
