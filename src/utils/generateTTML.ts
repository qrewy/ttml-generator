import { LyricLine } from '../types';
import { formatTTMLTime } from './formatTime';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateTTML(lines: LyricLine[]): string {
  const syncedLines = lines.filter(
    (line) => line.begin !== null && line.end !== null && line.end > line.begin,
  );

  const paragraphs = syncedLines
    .map(
      (line) =>
        `      <p begin="${formatTTMLTime(line.begin!)}" end="${formatTTMLTime(line.end!)}">${escapeXml(line.text)}</p>`,
    )
    .join('\n');

return `<?xml version="1.0" encoding="UTF-8"?>
<tt xmlns="http://www.w3.org/ns/ttml"
    xmlns:tts="http://www.w3.org/ns/ttml#styling"
    xmlns:ttm="http://www.w3.org/ns/ttml#metadata"
    xml:lang="en">
  <head>
    <styling>
      <style xml:id="defaultStyle" tts:textAlign="center" tts:displayAlign="after"/>
    </styling>
    <layout>
      <region xml:id="defaultRegion" style="defaultStyle"/>
    </layout>
  </head>
  <body>
    <div>
${paragraphs}
    </div>
  </body>
</tt>`;
}