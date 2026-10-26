import { useEffect, useRef, useState } from 'react';
import { startWaveBackground } from './wave-engine';
import './wave-background.css';

type Props = {
  spriteSrc: string;
  speed: number;
  waveHeight: number;
};

export default function WaveBackground({ spriteSrc, speed, waveHeight }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surferRef = useRef<HTMLDivElement>(null);
  const [flipping, setFlipping] = useState(false);
  const [landing, setLanding] = useState(false);

  function flip() {
    if (flipping) return;
    setLanding(false);
    setFlipping(true);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startWaveBackground(canvas, {
      speed, waveHeight,
      getSurferWidth: () => surferRef.current?.offsetWidth ?? 0,
      onFrame: ({ surfaceX, surfaceY, surfaceAngle }) => {
        const surfer = surferRef.current;
        if (!surfer) return;
        surfer.style.left = `${surfaceX * 100}%`;
        surfer.style.top = `${surfaceY * 100}%`;
        surfer.style.setProperty('--wave-angle', `${surfaceAngle}deg`);
      },
    });
  }, [speed, waveHeight]);

  return (
    <div className="pixel-waves">
      <canvas className="pixel-waves__canvas" ref={canvasRef} aria-hidden="true" />
      <div className="pixel-waves__surfer" ref={surferRef}>
        <button
          type="button"
          className={`pixel-waves__character ${flipping ? 'pixel-waves__character--flipping' : ''}`}
          aria-label="Make Pikachu flip"
          title="Click to flip!"
          onClick={flip}
          onAnimationEnd={() => {
            setFlipping(false);
            setLanding(true);
          }}
        >
          <img className="pixel-waves__sprite" src={spriteSrc} alt="" draggable={false} />
        </button>
        {landing && <span className="pixel-waves__splash" aria-hidden="true" onAnimationEnd={() => setLanding(false)} />}
      </div>
    </div>
  );
}
