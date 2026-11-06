export function displayBytes(text: string): number {
  return [...text].reduce((sum, char) => sum + (char.charCodeAt(0) <= 0x7f ? 1 : 2), 0);
}
export function utf8Bytes(text: string): number { return new TextEncoder().encode(text).length; }
export function textMetrics(text: string) {
  const noSpaces = text.replace(/\s/g, '');
  return { withSpaces: text.length, withBytes: displayBytes(text), noSpaces: noSpaces.length, noSpacesBytes: displayBytes(noSpaces), utf8: utf8Bytes(text) };
}
export function incompleteCount(text: string): number {
  return (text.match(/\[(?:확인 필요|작성자 경험 입력)[^\]]*\]/g) ?? []).length;
}
