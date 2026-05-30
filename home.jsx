/* MyBar — Home / dot-grid calendar screen */
const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

// ── A single calendar dot ──
function CalDot({ d, status, onTap }) {
  const isRest = d.type === 'R';
  const letter = d.type;
  // base styles per status
  let bg = 'transparent', color = 'var(--ink-3)', ring = 'none', op = 1, scale = 1, weight = 700;
  if (isRest) {
    // rest = open ring "breath"
    bg = 'transparent';
    ring = status === 'past' ? '1.5px solid var(--line-2)' : '1.5px solid var(--faint-2)';
    color = 'transparent';
    scale = 0.62;
  } else if (status === 'done') {
    bg = 'var(--ink)'; color = 'var(--warm-white)';
  } else if (status === 'today') {
    bg = 'var(--orange)'; color = 'var(--warm-white)';
  } else if (status === 'missed') {
    bg = 'transparent'; ring = '1.6px dashed var(--faint)'; color = 'var(--ink-3)'; op = 0.65;
  } else { // upcoming
    bg = 'var(--faint)'; color = '#A39C8C';
  }
  return (
    <button
      onClick={() => onTap(d)}
      aria-label={`Day ${d.day} ${d.typeName}`}
      style={{
        position: 'relative', width: '100%', aspectRatio: '1 / 1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0,
      }}>
      <span style={{
        width: '78%', height: '78%', borderRadius: '50%',
        transform: `scale(${scale})`,
        background: bg, border: ring, opacity: op,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .18s, transform .18s',
        boxShadow: status === 'today' ? '0 0 0 4px var(--orange-soft)' : 'none',
      }}>
        {!isRest && (
          <span className="tnum" style={{
            fontSize: 10.5, fontWeight: weight, color, letterSpacing: '0.02em',
          }}>{letter}</span>
        )}
        {isRest && (
          <span style={{ width: 3, height: 3, borderRadius: '50%',
            background: status === 'past' ? 'var(--line-2)' : 'var(--faint-2)' }} />
        )}
      </span>
      {status === 'today' && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          animation: 'mb-fade .4s ease', pointerEvents: 'none',
        }} />
      )}
    </button>
  );
}

// ── Block-phase banner: proportional 4-segment progress ──
function BlockBanner({ currentDay }) {
  const { BLOCKS } = window.MYBAR;
  const TOTAL = 60;
  const pct = (n) => (n / TOTAL) * 100;
  const cur = window.MYBAR.blockOf(currentDay);
  return (
    <div style={{ padding: '0 22px', marginTop: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
        <span className="type-overline" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--ink)', textTransform: 'uppercase' }}>
          Block {cur.n} · {cur.name}
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>{cur.tagline}</span>
      </div>
      {/* track */}
      <div style={{ position: 'relative', height: 6, borderRadius: 999, background: 'var(--paper-deep)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct(currentDay)}%`,
          background: 'var(--ink)', borderRadius: 999, transition: 'width .4s' }} />
        {/* block dividers */}
        {BLOCKS.slice(0, -1).map(b => (
          <div key={b.n} style={{ position: 'absolute', top: -1, bottom: -1, left: `${pct(b.to)}%`,
            width: 2, background: 'var(--paper)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: 7 }}>
        {BLOCKS.map(b => {
          const w = ((b.to - b.from + 1) / TOTAL) * 100;
          const active = currentDay >= b.from && currentDay <= b.to;
          return (
            <div key={b.n} style={{ width: `${w}%`, textAlign: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                color: active ? 'var(--ink)' : 'var(--ink-3)' }}>{b.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Home({ currentDay, streak, statusOf, completedCount, onOpenDay }) {
  const { DAYS, WEEKDAY_INITIALS, TYPE_INFO } = window.MYBAR;
  const today = DAYS[currentDay - 1];
  const ti = TYPE_INFO[today.type];
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="screen anim-fade" style={{ overflowY: 'auto' }}>
      <div style={{ paddingTop: 'var(--safe-top)' }} />

      {/* top row: wordmark + streak */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '6px 22px 0' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--ink-3)' }}>MYBAR</span>
        <div style={{ textAlign: 'right', lineHeight: 1 }}>
          <div className="tnum" style={{ fontSize: 19, fontWeight: 700, color: streak > 0 ? 'var(--orange)' : 'var(--ink-3)' }}>{streak}</div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: 2 }}>day streak</div>
        </div>
      </div>

      {/* hero: big day number + type label + weekday (photo composition) */}
      <div style={{ padding: '10px 22px 0' }}>
        <div className="tnum" style={{ fontSize: 116, fontWeight: 700, lineHeight: 0.86,
          letterSpacing: '-0.05em', color: 'var(--ink)' }}>{pad(currentDay)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.04, textTransform: 'uppercase' }}>
              {ti.name.split(' + ').map((w, i, a) => (
                <span key={i}>{w}{i < a.length - 1 ? <span style={{ color: 'var(--faint)' }}> + </span> : ''}</span>
              ))}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-3)', marginTop: 4 }}>Day {currentDay} of 60</div>
          </div>
          <div style={{ fontSize: 25, fontWeight: 400, color: 'var(--ink-2)', fontFamily: 'var(--font-serif)' }}>{today.weekday}</div>
        </div>
      </div>

      {/* block banner */}
      <div style={{ marginTop: 22 }}>
        <BlockBanner currentDay={currentDay} />
      </div>

      {/* dot grid */}
      <div style={{ padding: '20px 22px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
          {WEEKDAY_INITIALS.map((w, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600,
              color: i === today.weekdayIdx ? 'var(--orange)' : 'var(--ink-3)', letterSpacing: '0.04em' }}>{w}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2 }}>
          {DAYS.map(d => (
            <CalDot key={d.day} d={d} status={statusOf(d.day)} onTap={onOpenDay} />
          ))}
        </div>
      </div>

      {/* legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
        padding: '6px 22px 0', fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 500 }}>
        <LegendItem label="Push" sw="P" /><LegendItem label="Pull" sw="L" /><LegendItem label="Legs" sw="H" />
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--faint-2)', display: 'inline-block' }} />Rest
        </span>
      </div>

      {/* spacer for sticky CTA */}
      <div style={{ height: 96 }} />

      {/* sticky CTA */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 18px calc(var(--safe-bot) + 8px)',
        background: 'linear-gradient(to top, var(--paper) 62%, rgba(231,225,213,0))' }}>
        <button onClick={() => onOpenDay(DAYS[currentDay - 1])}
          style={{ width: '100%', height: 54, borderRadius: 'var(--r-lg)',
            background: today.type === 'R' ? 'var(--card)' : 'var(--ink)',
            color: today.type === 'R' ? 'var(--ink)' : 'var(--warm-white)',
            fontSize: 16, fontWeight: 600, letterSpacing: '0.01em',
            boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          {today.type === 'R' ? 'Rest Day — recover well' : `Start Day ${currentDay} · ${ti.short}`}
          {today.type !== 'R' && <Icon name="chevron-r" size={18} stroke="var(--warm-white)" />}
        </button>
      </div>
    </div>
  );
}

function LegendItem({ label, sw }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 13, height: 13, borderRadius: '50%', background: 'var(--faint)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 8, fontWeight: 700, color: '#A39C8C' }}>{sw}</span>{label}
    </span>
  );
}

Object.assign(window, { Home });
