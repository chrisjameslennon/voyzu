export interface AvatarColor {
  bg: string;
  fg: string;
}

export function getRandomDeterministicColor(seed: string): AvatarColor {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
    hash |= 0;
  }

  const hue = Math.abs(hash) % 360;

  return {
    bg: `hsl(${hue}, 65%, 88%)`,
    fg: `hsl(${hue}, 55%, 35%)`,
  };
}
