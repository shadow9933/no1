
import { VocabRow } from '../types';

export function download(filename: string, content: string, mime: string = "text/csv"): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseTextToVocabRows(input: string): VocabRow[] {
  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];
  
  const delim = lines[0].includes("\t") ? "\t" : ",";
  
  let stringRows = lines.map((line) => line.split(delim).map((c) => c.trim().replace(/^"(.*)"$/, '$1')));
  
  const header = stringRows[0].join(',').toLowerCase();
  if (header.includes('word') && (header.includes('meaning') || header.includes('ipa'))) {
    stringRows.shift();
  }

  return stringRows.map((cols) => {
    let word = '', ipa = '', meaning = '';
    if (cols.length === 1) {
      word = cols[0];
    } else if (cols.length === 2) {
      word = cols[0];
      meaning = cols[1];
    } else {
      word = cols[0];
      ipa = cols[1];
      meaning = cols.slice(2).join(" ");
    }
    return { word, ipa, meaning };
  }).filter(row => row.word);
}
