export function splitTextWithUrls(
  text: string
): Array<{ type: "text"; value: string } | { type: "url"; value: string }> {
  const URL_REGEX = /https?:\/\/[^\s　、。！）」』"'<>]+/g;
  const segments: Array<{ type: "text"; value: string } | { type: "url"; value: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "url", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}
