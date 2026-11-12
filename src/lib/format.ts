export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

function inline(value: string) {
  return escapeHtml(value).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" rel="noopener noreferrer" style="color:#5B4BDB;text-decoration:underline">$1</a>');
}

export function articleToHtml(text: string): string {
  const lines = text.replace(/\r/g, '').split('\n');
  const out: string[] = []; let listOpen = false; let tableRows: string[][] = [];
  const closeList = () => { if (listOpen) { out.push('</ul>'); listOpen = false; } };
  const flushTable = () => {
    if (!tableRows.length) return;
    const rows = tableRows.filter((row) => !row.every((cell) => /^[-:]+$/.test(cell)));
    out.push('<table style="border-collapse:collapse;width:100%;margin:16px 0">');
    rows.forEach((row, ri) => out.push(`<tr>${row.map((cell) => `<td style="border:1px solid #d8dbe6;padding:8px;${ri === 0 ? 'font-weight:700;background:#f0efff' : ''}">${inline(cell)}</td>`).join('')}</tr>`));
    out.push('</table>'); tableRows = [];
  };
  lines.forEach((raw) => {
    const line = raw.trim();
    if (line.startsWith('|') && line.endsWith('|')) { closeList(); tableRows.push(line.slice(1, -1).split('|').map((c) => c.trim())); return; }
    flushTable();
    if (!line) { closeList(); out.push('<br>'); return; }
    if (/^[-*]\s/.test(line)) { if (!listOpen) { out.push('<ul style="padding-left:22px;margin:10px 0">'); listOpen = true; } out.push(`<li style="margin:4px 0">${inline(line.slice(2))}</li>`); return; }
    closeList();
    if (line.startsWith('■') || /^Q\d+\./.test(line)) out.push(`<p style="font-size:20px;font-weight:700;line-height:1.6;margin:24px 0 10px;color:#242334">${inline(line)}</p>`);
    else if (/^\[이미지 \d+/.test(line)) out.push(`<p style="padding:14px;background:#f6f3ff;border:1px dashed #5B4BDB;color:#4437ad;border-radius:8px">${inline(line)}</p>`);
    else if (/^\[(확인 필요|작성자 경험 입력)/.test(line)) out.push(`<p style="padding:12px;background:#fff4c7;color:#6d5000;border-radius:8px">${inline(line)}</p>`);
    else out.push(`<p style="font-size:16px;line-height:1.8;margin:8px 0;color:#242334">${inline(line)}</p>`);
  }); closeList(); flushTable(); return out.join('');
}

export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html'); return doc.body.textContent || '';
}

export async function copyArticle(text: string, html = articleToHtml(text)): Promise<'rich' | 'plain'> {
  if (navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([text], { type: 'text/plain' }) })]);
      return 'rich';
    } catch { /* fallback below */ }
  }
  await navigator.clipboard.writeText(text); return 'plain';
}

export function downloadFile(name: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
