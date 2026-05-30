/* MyBar — icons (Lucide-style stroke) + tiny shared bits. Exports to window. */
const Icon = ({ name, size = 20, stroke = 'currentColor', sw = 1.9, style }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'back':    return <svg {...p}><path d="M15 18l-6-6 6-6"/></svg>;
    case 'check':   return <svg {...p}><path d="M20 6L9 17l-5-5"/></svg>;
    case 'plus':    return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus':   return <svg {...p}><path d="M5 12h14"/></svg>;
    case 'play':    return <svg {...p} fill={stroke} stroke="none"><path d="M7 5v14l11-7z"/></svg>;
    case 'pause':   return <svg {...p}><path d="M9 5v14M15 5v14"/></svg>;
    case 'reset':   return <svg {...p}><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.7L3 8"/><path d="M3 4v4h4"/></svg>;
    case 'clock':   return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'skip':    return <svg {...p}><path d="M5 4l10 8-10 8zM19 5v14"/></svg>;
    case 'flame':   return <svg {...p}><path d="M12 3c2 3 .5 5 2.5 7.5C16 12 17 13.4 17 15.5A5 5 0 017 15.5c0-2 1-3.2 2-4.5.6 1 1.5 1.4 2 2 .3-2.6-1.6-4.6 1-10z"/></svg>;
    case 'gloves':  return <svg {...p}><path d="M8 11V5.5a1.5 1.5 0 013 0V10m0 0V4.5a1.5 1.5 0 013 0V11m0-3.5a1.5 1.5 0 013 0V14a6 6 0 01-6 6h-1.2a5 5 0 01-3.5-1.5L6 16c-1-1 .5-3 2-2l1 1V8a1.5 1.5 0 013 0"/></svg>;
    case 'leaf':    return <svg {...p}><path d="M11 20A7 7 0 014 13c0-6 5-9 12-9 0 7-3 12-9 12z"/><path d="M11 20c0-4 1-6 4-9"/></svg>;
    case 'moon':    return <svg {...p}><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>;
    case 'chevron-r': return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    default: return null;
  }
};

window.Icon = Icon;
