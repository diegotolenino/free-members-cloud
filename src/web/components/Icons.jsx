const icons = {
  home: (
    <>
      <path d="M4 10.75L12 4l8 6.75V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.25Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  courses: (
    <>
      <rect x="4.5" y="5.25" width="14.5" height="13.5" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 5.25v13.5M12 8.25h4M12 12h4M12 15.75h3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  courseLibrary: (
    <>
      <path d="M6.25 7.25a1.75 1.75 0 0 1 1.75-1.75h8.25A1.75 1.75 0 0 1 18 7.25v9.5A1.75 1.75 0 0 1 16.25 18.5H8A1.75 1.75 0 0 1 6.25 16.75Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M8.5 8.5H15M8.5 11.25h3.25M8.5 14h6.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M4.5 8.75V16a1.5 1.5 0 0 0 1.5 1.5h.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="m14.8 9.2 2.45 1.55-2.45 1.55Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  pages: (
    <>
      <path d="M7 4.5h7.5L19 9v10.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M14.5 4.5V9H19" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9.5 12h5M9.5 15.5h5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  students: (
    <>
      <circle cx="9" cy="8.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 17a4.5 4.5 0 0 1 9 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="17.5" cy="9.5" r="1.9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.5 16.75c.32-1.7 1.4-2.75 3.25-3.15" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  messages: (
    <>
      <path d="M6 7.25h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-5.5L8 20v-2.75H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  integrations: (
    <>
      <path d="M10 8.5l4-4a3 3 0 1 1 4.25 4.25l-3 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M14 15.5l-4 4a3 3 0 1 1-4.25-4.25l3-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  sales: (
    <>
      <path d="M7 7h12l-1.6 7.2a1 1 0 0 1-1 .8H9a1 1 0 0 1-1-.78L6.2 5.8H4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="10" cy="18.5" r="1.25" fill="currentColor" />
      <circle cx="16" cy="18.5" r="1.25" fill="currentColor" />
    </>
  ),
  moneyCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v8M14.8 9.8c0-.9-1.1-1.55-2.8-1.55s-2.8.65-2.8 1.55c0 .92.9 1.28 2.8 1.64 1.85.37 2.8.8 2.8 1.8 0 1.03-1.12 1.76-2.8 1.76s-2.8-.73-2.8-1.76" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  chart: (
    <>
      <path d="M6 18V9M12 18V6M18 18v-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M4 18.5h16M6 13l4-4 3 2 5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="4.5" y="6.5" width="15" height="13" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 4.5v4M16 4.5v4M4.5 10.25h15" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.75v4.7l3.1 1.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  search: <path d="M20 20l-4.35-4.35M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />,
  plus: <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />,
  bell: (
    <>
      <path d="M8 10a4 4 0 1 1 8 0c0 4 1.8 5.75 1.8 5.75H6.2S8 14 8 10Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M10.5 18a1.5 1.5 0 0 0 3 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.7 9.3A2.6 2.6 0 1 1 14.6 11c-.55.73-1.52 1.16-2.03 1.97" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M12 16.7h0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
    </>
  ),
  eye: (
    <>
      <path d="M2.75 12S6.15 6.75 12 6.75 21.25 12 21.25 12 17.85 17.25 12 17.25 2.75 12 2.75 12Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  play: <path d="M9 7.5v9l7-4.5-7-4.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />,
  save: (
    <>
      <path d="M5 4.5h10.5L19 8v11.5H5z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M8.5 4.5V9h6V4.5M8.5 19v-5h7V19" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  archive: (
    <>
      <path d="M4 7h16v3.75H4zM6.25 10.75h11.5V19a1 1 0 0 1-1 1H7.25a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M10 14h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  trash: (
    <>
      <path d="M8 7.25h8M10 4.75h4M6.5 7.25l.85 11.1a1 1 0 0 0 1 .92h7.3a1 1 0 0 0 1-.92l.85-11.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M10 10.25v5.5M14 10.25v5.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  module: (
    <>
      <rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="4.5" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4.5" y="13" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  cube: (
    <>
      <path d="m12 4 7 4v8l-7 4-7-4V8l7-4Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="m5 8 7 4 7-4M12 12v8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 5.5h8v3.75a4 4 0 0 1-8 0V5.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M8 7H5.5v1.2A3.3 3.3 0 0 0 8.7 11M16 7h2.5v1.2a3.3 3.3 0 0 1-3.2 2.8M12 13.25v3.25M9.5 19h5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  shield: (
    <>
      <path d="M12 4.5 18.5 7v5.2c0 3.5-2.45 6.25-6.5 7.3-4.05-1.05-6.5-3.8-6.5-7.3V7L12 4.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="m9.3 12.2 1.75 1.75 3.85-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.8 14.2c.8 1.05 1.85 1.55 3.2 1.55s2.4-.5 3.2-1.55M9.4 10h.01M14.6 10h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </>
  ),
  bolt: (
    <>
      <path d="M13.5 3.75 6.75 13h4.6l-.85 7.25L17.25 11h-4.6l.85-7.25Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  layers: (
    <>
      <path d="m12 5.25 7 3.75-7 3.75L5 9l7-3.75Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="m5 12.75 7 3.75 7-3.75M5 16.25 12 20l7-3.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  lesson: (
    <>
      <path d="M7 4.75h8l3 3v11.5H7a1 1 0 0 1-1-1V5.75a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M15 4.75v3h3M9.5 10.5h5M9.5 14h5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  material: (
    <>
      <path d="M7.5 7h9a2 2 0 0 1 2 2v7.25H5.5V9a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9 7V5.5h6V7" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 4.25v1.7M12 18.05v1.7M19.75 12h-1.7M5.95 12h-1.7M17.48 6.52l-1.2 1.2M7.72 16.28l-1.2 1.2M17.48 17.48l-1.2-1.2M7.72 7.72l-1.2-1.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  filter: (
    <>
      <path d="M4.75 6.5h14.5l-5.75 6v5l-3 1.5v-6.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  appearance: (
    <>
      <path d="M12 4.75a7.25 7.25 0 1 0 0 14.5h.8a1.95 1.95 0 0 0 1.56-3.12 1.5 1.5 0 0 1 1.2-2.38h1.19A3.5 3.5 0 0 0 20.25 10 5.25 5.25 0 0 0 15 4.75Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="8.2" cy="11" r="1" fill="currentColor" />
      <circle cx="10.6" cy="8.1" r="1" fill="currentColor" />
      <circle cx="14.2" cy="8.5" r="1" fill="currentColor" />
    </>
  ),
  published: <path d="M5 12.5l3.2 3.2L19 5.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
  draft: <path d="M5 17l11.25-11.25 2 2L7 19H5z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />,
  edit: (
    <>
      <path d="M4.5 19.5h3.3L18.4 8.9a1.7 1.7 0 0 0 0-2.4l-.9-.9a1.7 1.7 0 0 0-2.4 0L4.5 16.2v3.3Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="m13.8 6.9 3.3 3.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  more: (
    <>
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.8 12.2 11 14.4l4.4-4.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  chevronDown: <path d="M6 9.5L12 15l6-5.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />,
  chevronUp: <path d="M6 14.5 12 9l6 5.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />,
  close: <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />,
  upload: (
    <>
      <path d="M12 16V7.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="m8.75 10.75 3.25-3.25 3.25 3.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M6.5 17.75h11a2 2 0 0 0 .37-3.97 4.5 4.5 0 0 0-8.72-1.05A3 3 0 0 0 6.5 17.75Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  download: (
    <>
      <path d="M12 7.5v8.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="m15.25 12.75-3.25 3.25-3.25-3.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M6.5 18.5h11" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  reorder: (
    <>
      <path d="M7 7h10M7 12h10M7 17h10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="m5 7 1.2-1.2M5 7l1.2 1.2M5 17l1.2-1.2M5 17l1.2 1.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </>
  ),
  strike: <path d="M8.2 7.7c.55-.9 1.78-1.45 3.3-1.45 1.88 0 3.25.84 3.25 2.2 0 1.2-.97 1.8-2.8 2.2-2.53.54-3.7 1.17-3.7 2.77 0 1.6 1.55 2.68 3.77 2.68 1.62 0 2.9-.52 3.57-1.46M6.5 12h11" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />,
  alignLeft: (
    <>
      <path d="M6 7.5h12M6 11h9M6 14.5h12M6 18h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  alignCenter: (
    <>
      <path d="M6 7.5h12M7.5 11h9M6 14.5h12M8 18h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  alignRight: (
    <>
      <path d="M6 7.5h12M9 11h9M6 14.5h12M10 18h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  image: (
    <>
      <rect x="4.5" y="5.5" width="15" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.5 16l3.3-3.3a1 1 0 0 1 1.4 0l1.55 1.55a1 1 0 0 0 1.4 0l1.1-1.1a1 1 0 0 1 1.4 0L18.5 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  drag: (
    <>
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="12" r="1.2" fill="currentColor" />
      <circle cx="8" cy="16" r="1.2" fill="currentColor" />
      <circle cx="16" cy="8" r="1.2" fill="currentColor" />
      <circle cx="16" cy="12" r="1.2" fill="currentColor" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" />
    </>
  ),
  bold: <path d="M9 6h4.5a3 3 0 0 1 0 6H9zm0 6h5a3 3 0 0 1 0 6H9z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />,
  italic: <path d="M13.5 5H10m4 14H10m4-14-4 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />,
  underline: <path d="M8 5v5a4 4 0 0 0 8 0V5M7 19h10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />,
  list: (
    <>
      <path d="M9 7h9M9 12h9M9 17h9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="5" cy="7" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="17" r="1" fill="currentColor" />
    </>
  ),
  numberedList: (
    <>
      <path d="M10 7h9M10 12h9M10 17h9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M4.5 7h1v3M4 11h2M4.5 15.5c0-.55.45-1 1-1h.15a1 1 0 0 1 .7 1.7L4 18h2.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </>
  ),
  link: (
    <>
      <path d="M10 8l4-4a3 3 0 1 1 4.25 4.25l-2.25 2.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M14 16l-4 4a3 3 0 1 1-4.25-4.25L8 13.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9 15l6-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
};

export default function Icon({ name, className = '', size = 20 }) {
  const icon = icons[name] || icons.settings;

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {icon}
    </svg>
  );
}
