import { LyricLine } from '../types';

export const demoLyrics = `When the lights go low
I can hear the city breathe
Every note is moving slow
Like a wave beneath my feet

Hold the line and let it play
We will mark each word in time
One more beat and one more phrase
Till the whole song starts to shine`;

export function parseLyrics(input: string): LyricLine[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `line-${index + 1}`,
      text,
      begin: index === 0 ? 0 : null,
      end: null,
    }));
}
