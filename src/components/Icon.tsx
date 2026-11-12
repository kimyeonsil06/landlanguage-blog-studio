const paths = {
  pen: 'M13.4 5.5l5.1 5.1M4 20l1.2-5.5L16.6 3.1a2 2 0 0 1 2.8 0l1.5 1.5a2 2 0 0 1 0 2.8L9.5 18.8 4 20z',
  archive: 'M3 5h18v4H3zM5 9v11h14V9M9 13h6',
  home: 'M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6',
  book: 'M3 5c4-1 6-1 9 1 3-2 6-2 9-1v13c-4-1-6-1-9 1-3-2-5-2-9-1zM12 6v13',
  settings: 'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 16l9 5 9-5',
  file: 'M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  check: 'M5 12l4 4L19 6', arrow: 'M4 12h15m-6-6 6 6-6 6',
  upRight: 'M6 18L18 6M7 6h11v11',
  plus: 'M12 5v14M5 12h14', chevron: 'M9 5l7 7-7 7',
  spark: 'M11 3c0 6-3 8-7 9 4 1 7 3 7 9 1-6 4-8 8-9-4-1-7-3-8-9zM19 2v5m-2.5-2.5h5',
  news: 'M4 4h14v16H4zM18 8h3v12H8M7 8h7M7 12h7M7 16h4',
  bulb: 'M9 17c0-3-4-4-4-8a7 7 0 0 1 14 0c0 4-4 5-4 8zM9 20h6',
  moon: 'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z',
  instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM17.5 6.5h.01',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  menu: 'M3 6h18M3 12h18M3 18h18', cloud: 'M7 17a5 5 0 1 1 0-10 6 6 0 0 1 11 1 4.5 4.5 0 0 1 0 9M9 15l2 2 4-5'
};
export function Icon({name, size=18}: {name:keyof typeof paths;size?:number}) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
