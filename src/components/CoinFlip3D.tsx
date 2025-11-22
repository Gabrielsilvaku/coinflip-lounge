import { useEffect, useState } from "react";
import gokuCoin from "@/assets/goku-coin.png";
import vegetaCoin from "@/assets/vegeta-coin.png";

interface CoinFlip3DProps {
  isFlipping: boolean;
  result: "heads" | "tails" | null;
  onFlipComplete?: () => void;
}

export const CoinFlip3D = ({ isFlipping, result, onFlipComplete }: CoinFlip3DProps) => {
  const [rotations, setRotations] = useState(0);

  useEffect(() => {
    if (isFlipping) {
      setRotations(0);
      const interval = setInterval(() => {
        setRotations(prev => prev + 180);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        if (onFlipComplete) {
          onFlipComplete();
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isFlipping, onFlipComplete]);

  const finalRotation = result === "tails" ? 180 : 0;

  return (
    <div className="relative w-64 h-64 perspective-1000">
      <div
        className="relative w-full h-full transition-transform duration-100 transform-style-3d"
        style={{
          transform: isFlipping
            ? `rotateY(${rotations}deg)`
            : `rotateY(${finalRotation}deg)`,
        }}
      >
        <div
          className="absolute w-full h-full backface-hidden rounded-full border-8 border-primary shadow-2xl overflow-hidden"
          style={{
            boxShadow: "0 0 60px rgba(0, 255, 255, 0.8)"
          }}
        >
          <img
            src={gokuCoin}
            alt="Goku - Heads"
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className="absolute w-full h-full backface-hidden rounded-full border-8 border-secondary shadow-2xl overflow-hidden"
          style={{
            transform: "rotateY(180deg)",
            boxShadow: "0 0 60px rgba(255, 0, 255, 0.8)"
          }}
        >
          <img
            src={vegetaCoin}
            alt="Vegeta - Tails"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
