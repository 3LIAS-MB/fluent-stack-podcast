import { Img } from 'remotion';

interface BackgroundProps {
  imageUrl: string;
  overlayOpacity?: number;
}

export const Background: React.FC<BackgroundProps> = ({
  imageUrl,
  overlayOpacity = 0.4,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}
    >
      <Img
        src={imageUrl}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
        }}
      />
    </div>
  );
};
