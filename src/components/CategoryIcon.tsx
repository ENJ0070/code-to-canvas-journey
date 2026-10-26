const symbols: Record<string, string[]> = {
  finder: ['M3 10l9-7 9 7 M5 9v12h5v-7h4v7h5V9'],
  sprzedawcy: ['M3 10l2-7h14l2 7 M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 M5 13v8h14v-8 M10 21v-6h4v6'],
  agenci: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M15 9l-2 4-4 2 2-4z'],
  promocje: ['M3 3h8l10 10-8 8L3 11z M7 7h.01 M12 10l5 5 M16 10h.01 M12 15h.01'],
  poradnik: ['M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1z M12 5v15'],
  tiktok: ['M14 3v12a4 4 0 1 1-4-4 M14 3c1 4 3 5 7 5 M14 7c2 3 4 4 7 4'],
  wszystkie: ['M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z'],
  akcesoria: ['M4 14a8 8 0 0 1 16 0 M4 14h16v3H4z M20 17l3 2h-9 M12 6v8'],
  'akcesoria (ciuch)': ['M5 3h14l-2 8 3 10H4l3-10z M7 11h10 M9 5v3 M15 5v3 M9 15h6'],
  'akcesoria (nie ciuch)': ['M4 9h5V6a3 3 0 1 1 6 0v3h5v5h-3a3 3 0 1 0 0 6h3v1H4v-5h3a3 3 0 1 0 0-6H4z'],
  bluzy: ['M8 6a4 4 0 0 1 8 0l4 3 2 8-4 1-1-5v8H7v-8l-1 5-4-1 2-8z M8 6l4 4 4-4 M9 16h6v3H9z'],
  buty: ['M3 11l4-6 4 7 5 2 5 1v5H3z M3 17h18 M10 10l-2 2 M12 12l-2 2'],
  elektronika: ['M4 14v-3a8 8 0 0 1 16 0v3 M4 12H2v7h5v-7z M20 12h2v7h-5v-7z'],
  klapki: ['M8 3c-4 0-5 5-5 10s2 8 5 8 5-3 5-8-1-10-5-10z M4 10l4 5 4-5 M8 15V7 M16 6c3-1 5 2 5 7s-1 7-4 8'],
  koszulki: ['M8 3H5L1 8l4 4 2-2v11h10V10l2 2 4-4-4-5h-3a4 4 0 0 1-8 0z'],
  kurtki: ['M8 3h8l4 5 2 11-4 1-1-9v10H7V11L6 20l-4-1L4 8z M8 3l4 5 4-5 M12 8v13 M8 15h2 M14 15h2'],
  'kurtki przeciwdeszczowe': ['M7 7a5 5 0 0 1 10 0l3 3 2 10-4 1-1-8v8H7v-8l-1 8-4-1 2-10z M7 7l5 3 5-3 M12 10v11 M3 2v2 M21 2v2'],
  lego: ['M3 8h18v12H3z M6 8V4h4v4 M14 8V4h4v4 M3 13h18 M8 13v7 M16 13v7'],
  'plecak/torby/torebki': ['M8 6V4a4 4 0 0 1 8 0v2 M6 6h12l2 5v10H4V11z M7 13h10v6H7z M7 10h10 M2 12v6 M22 12v6'],
  portfele: ['M3 6l14-3v3 M3 6h18v15H3z M21 11h-7v5h7 M17 13.5h.1'],
  room: ['M4 13V5h16v8 M4 8h16 M7 11h4v3H7z M13 11h4v3h-4z M2 14h20v6H2z M4 20v2 M20 20v2'],
  sets: ['M5 2H3L1 5l2 2 1-1v6h7V6l1 1 2-2-2-3h-2a2.5 2.5 0 0 1-5 0z M14 12h8l1 10h-4l-1-6-1 6h-4z M14 15h8'],
  spodenki: ['M5 3h14l2 17h-7l-2-8-2 8H3z M5 7h14 M12 7v5 M6 10l-2 3 M18 10l2 3'],
  spodnie: ['M6 2h12l1 20h-5l-2-13-2 13H5z M6 6h12 M12 2v7 M6 8l3-2 M18 8l-3-2'],
  zegarki: ['M9 2h6l1 5 M9 22h6l1-5 M9 2L8 7 M9 22l-1-5 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10 M12 9v3l2 1 M18 11h2v2h-2'],
};

function normalizedName(name: string) {
  return name.trim().toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
}

export function CategoryIcon({ name, className = 'text-foreground' }: { name: string; className?: string }) {
  const key = normalizedName(name);
  const paths = symbols[key] ?? ['M12 3l9 5v9l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v9'];
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    {paths.map((d, i) => <path key={i} d={d}/>)}
  </svg>;
}