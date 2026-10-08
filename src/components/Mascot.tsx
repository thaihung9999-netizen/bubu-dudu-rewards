import React from 'react';
import type { CharacterType, MascotExpression } from '../types';

interface MascotProps {
  character: CharacterType;
  expression?: MascotExpression;
  size?: number | string;
  className?: string;
  animate?: boolean;
}

export const Mascot: React.FC<MascotProps> = ({
  character,
  expression = 'happy',
  size = 100,
  className = '',
  animate = true,
}) => {
  const sizeNum = typeof size === 'number' ? size : parseInt(size.toString()) || 100;

  // Resolve authentic sticker image URL based on character and expression
  let stickerUrl = '/stickers/bubu_solo_hat.png';

  if (character === 'dudu') {
    if (expression === 'sad' || expression === 'pout') {
      stickerUrl = '/stickers/dudu_solo_grumpy.png';
    } else if (expression === 'love') {
      stickerUrl = '/stickers/flowers_love.png';
    } else {
      stickerUrl = '/stickers/dudu_solo_bag.png';
    }
  } else if (character === 'baby_bear') {
    stickerUrl = '/stickers/bubu_mochi.png';
  } else if (character === 'panda') {
    stickerUrl = '/stickers/cuddle_mochi.png';
  } else {
    // Bubu
    if (expression === 'sad' || expression === 'pout') {
      stickerUrl = '/stickers/bubu_solo_skincare.png';
    } else if (expression === 'love') {
      stickerUrl = '/stickers/warm_hug.png';
    } else {
      stickerUrl = '/stickers/bubu_solo_hat.png';
    }
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        animate ? 'transition-transform duration-300 hover:scale-110 active:scale-95' : ''
      } ${className}`}
      style={{ width: sizeNum, height: sizeNum }}
    >
      <img
        src={stickerUrl}
        alt={`${character} (${expression})`}
        className="w-full h-full object-contain filter drop-shadow-sm"
      />
    </div>
  );
};
