/* MyBar — Day View, hold timer (count-up), rest timer (countdown), Rest Day */
const { useState: useS, useEffect: useE, useRef: useR } = React;

/* ───────────────── Hold timer — counts UP toward a target ───────────────── */
function HoldTimer({ exName, setLabel, target, onLog, onClose }) {
  const [elapsed, setElapsed] = useS(0);        // seconds (float)
  const [running, setRunning] = useS(true);
  const startRef = useR(performance.now());
  const baseRef = useR(0);

  useE(() => {
    if (!running) return;
    startRef.current = performance.now();
    let raf;
    const tick = () => {
      const now = performance.now();
      setElapsed(baseRef.current + (now - startRef.current) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const pause = () => { baseRef.current = elapsed; setRunning(false); };
  const resume = () => { setRunning(true); };
  const reset = () => { baseRef.current = 0; setElapsed(0); setRunning(true); };

  const reached = elapsed >= target;
  const frac = Math.min(elapsed / target, 1);
  const R = 86, C = 2 * Math.PI * R;
  const whole = Math.floor(elapsed);

  return (
    <div className="anim-fade" style={{ position: 'absolute', inset: 0, zIndex: 40,
      background: 'rgba(27,26,22,0.32)', display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        animation: 'mb-rise .32s cubic-bezier(.32,.72,0,1) both',
        width: '100%', background: 'var(--card)', borderRadius: '24px 24px 0 0',
        padding: '20px 22px calc(var(--safe-bot) + 18px)', boxShadow: 'var(--shadow-pop)' }}>
        <div style={{ width: 38, height: 4, borderRadius: 99, background: 'var(--line-2)', margin: '0 auto 16px' }} />
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <span className="type-overline" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{setLabel} · Hold</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 17, fontWeight: 600, marginBottom: 18 }}>{exName}</div>

        {/* count-up ring */}
        <div style={{ position: 'relative', width: 208, height: 208, margin: '0 auto' }}>
          <svg width="208" height="208" viewBox="0 0 208 208" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="104" cy="104" r={R} fill="none" stroke="var(--paper-deep)" strokeWidth="9" />
            <circle cx="104" cy="104" r={R} fill="none"
              stroke={reached ? 'var(--orange)' : 'var(--ink)'} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - frac)}
              style={{ transition: 'stroke .2s' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center' }}>
            <div className="tnum" style={{ fontSize: 58, fontWeight: 700, lineHeight: 1,
              color: reached ? 'var(--orange)' : 'var(--ink)' }}>{whole}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginTop: 4 }}>
              {reached ? 'target reached' : `target ${target}s`}
            </div>
          </div>
        </div>

        {/* controls */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '22px 0 16px' }}>
          <RoundBtn icon="reset" onClick={reset} />
          <button onClick={running ? pause : resume} style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-card)' }}>
            <Icon name={running ? 'pause' : 'play'} size={26} stroke="var(--warm-white)" />
          </button>
          <RoundBtn icon="check" onClick={() => onLog(whole)} solid={reached} />
        </div>
        <button onClick={() => onLog(whole)} style={{
          width: '100%', height: 50, borderRadius: 'var(--r-md)',
          background: reached ? 'var(--orange)' : 'var(--ink)', color: 'var(--warm-white)',
          fontSize: 15, fontWeight: 600 }}>
          Log set{whole ? ` · held ${whole}s` : ''}
        </button>
      </div>
    </div>
  );
}

function RoundBtn({ icon, onClick, solid }) {
  return (
    <button onClick={onClick} style={{
      width: 64, height: 64, borderRadius: '50%',
      background: solid ? 'var(--orange-soft)' : 'var(--paper-deep)',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={22} stroke={solid ? 'var(--orange)' : 'var(--ink-2)'} />
    </button>
  );
}

/* ───────────────── Rest timer — slim countdown bar ───────────────── */
function RestBar({ remaining, total, onAdjust, onSkip }) {
  const m = Math.floor(remaining / 60), s = remaining % 60;
  const frac = total ? remaining / total : 0;
  return (
    <div className="anim-fade" style={{ position: 'absolute', left: 12, right: 12,
      bottom: 'calc(var(--safe-bot) + 8px)', zIndex: 30,
      background: 'var(--ink)', color: 'var(--warm-white)', borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-pop)', padding: '12px 14px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${frac * 100}%`,
        background: 'rgba(236,91,36,0.22)', transition: 'width 1s linear' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name="clock" size={18} stroke="var(--warm-white)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.6, textTransform: 'uppercase' }}>Rest</div>
          <div className="tnum" style={{ fontSize: 21, fontWeight: 700, lineHeight: 1 }}>{m}:{String(s).padStart(2, '0')}</div>
        </div>
        <button onClick={() => onAdjust(-15)} style={pill}>−15</button>
        <button onClick={() => onAdjust(15)} style={pill}>+15</button>
        <button onClick={onSkip} style={{ ...pill, background: 'var(--orange)', color: 'var(--warm-white)' }}>Skip</button>
      </div>
    </div>
  );
}
const pill = { background: 'rgba(245,241,232,0.14)', color: 'var(--warm-white)',
  fontSize: 12, fontWeight: 700, padding: '8px 11px', borderRadius: 999 };

/* ───────────────── Set chip ───────────────── */
function SetChip({ label, done, timed, onTap }) {
  return (
    <button onClick={onTap} style={{
      minWidth: timed ? 46 : 40, height: 40, padding: timed ? '0 8px' : 0,
      borderRadius: timed ? 'var(--r-sm)' : '50%',
      background: done ? 'var(--ink)' : 'var(--card-hi)',
      border: done ? 'none' : '1.5px solid var(--line-2)',
      color: done ? 'var(--warm-white)' : 'var(--ink-3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background .15s, border .15s', position: 'relative' }}>
      {done
        ? <span style={{ animation: 'mb-fill .22s cubic-bezier(.175,.885,.32,1.275)' }}><Icon name="check" size={18} stroke="var(--warm-white)" sw={2.4} /></span>
        : <span className="tnum" style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>}
      {timed && !done && (
        <span style={{ position: 'absolute', right: -2, bottom: -2, width: 13, height: 13,
          borderRadius: '50%', background: 'var(--orange)', display: 'flex',
          alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="play" size={8} stroke="var(--warm-white)" />
        </span>
      )}
    </button>
  );
}

/* ───────────────── Exercise card ───────────────── */
function ExerciseCard({ ex, si, ei, ticks, onToggle, onHold }) {
  const { isTimed, targetSeconds } = window.MYBAR;
  const timed = isTimed(ex.reps);
  const target = targetSeconds(ex.reps);
  const doneCount = Array.from({ length: ex.sets }).filter((_, k) => ticks[`${si}.${ei}.${k}`]).length;
  const allDone = doneCount === ex.sets;

  return (
    <div style={{
      background: 'var(--card)', borderRadius: 'var(--r-lg)', padding: '15px 16px 16px',
      boxShadow: 'var(--shadow-card)', opacity: allDone ? 0.62 : 1,
      transition: 'opacity .25s', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
              textDecoration: allDone ? 'line-through' : 'none', textDecorationColor: 'var(--ink-3)' }}>{ex.name}</span>
            {ex.gloves && (
              <span title="Gloves on" style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                color: 'var(--ink-3)', background: 'var(--paper-deep)', padding: '3px 7px 3px 5px', borderRadius: 999 }}>
                <Icon name="gloves" size={12} stroke="var(--ink-2)" sw={1.7} />Gloves
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>{ex.note}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{ex.sets}<span style={{ color: 'var(--faint)', fontWeight: 500 }}>×</span>{ex.reps}</div>
          <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: 2 }}>
            {timed ? 'hold' : (/ea$/.test(ex.reps) ? 'each side' : 'reps')}
          </div>
        </div>
      </div>

      {/* set chips */}
      <div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
        {Array.from({ length: ex.sets }).map((_, k) => {
          const done = !!ticks[`${si}.${ei}.${k}`];
          const repNum = ex.reps.replace(/\s*ea$/, '');
          return (
            <SetChip key={k} done={done} timed={timed}
              label={timed ? `${target}s` : repNum}
              onTap={() => {
                if (timed && !done) onHold(ex, si, ei, k, target);
                else onToggle(si, ei, k, !done);
              }} />
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────── Day View ───────────────── */
function DayView({ day, ticks, onToggle, onBack, dayComplete, totalSets, doneSets }) {
  const { TYPE_INFO } = window.MYBAR;
  const d = window.MYBAR.DAYS[day - 1];
  const ti = TYPE_INFO[d.type];
  const [hold, setHold] = useS(null);          // {ex,si,ei,k,target}
  const [rest, setRest] = useS(null);          // {remaining,total}
  const restRef = useR(null);
  const pad = (n) => String(n).padStart(2, '0');

  // rest countdown
  useE(() => {
    if (!rest) return;
    if (rest.remaining <= 0) { setRest(null); return; }
    restRef.current = setTimeout(() => setRest(r => r ? { ...r, remaining: r.remaining - 1 } : null), 1000);
    return () => clearTimeout(restRef.current);
  }, [rest]);

  const startRest = (secs = 75) => setRest({ remaining: secs, total: secs });

  const handleToggle = (si, ei, k, val) => {
    onToggle(si, ei, k, val);
    if (val) startRest(75);
  };
  const handleHoldLog = (heldSecs) => {
    const { si, ei, k } = hold;
    onToggle(si, ei, k, true);
    setHold(null);
    startRest(75);
  };

  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;

  return (
    <div className="screen anim-in" style={{ background: 'var(--paper)' }}>
      {/* header */}
      <div style={{ paddingTop: 'var(--safe-top)', flexShrink: 0,
        background: 'var(--paper)', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 14px 0' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 2,
            fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', padding: '6px 6px 6px 0' }}>
            <Icon name="back" size={20} stroke="var(--ink-2)" />Calendar
          </button>
          {/* progress ring mini */}
          <MiniRing pct={pct} done={dayComplete} />
        </div>
        <div style={{ padding: '6px 22px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span className="tnum" style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{pad(day)}</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink-3)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Block {d.block} · {d.blockName}</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 8 }}>{ti.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}>{d.weekday} · {ti.focus}</div>
        </div>
      </div>

      {/* scrolling exercise list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2px 16px 130px' }}>
        {d.sections.map((sec, si) => (
          <div key={si} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 4px 11px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--ink)', textTransform: 'uppercase' }}>{sec.name}</span>
              <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)' }}>{sec.exercises.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sec.exercises.map((ex, ei) => (
                <ExerciseCard key={ei} ex={ex} si={si} ei={ei} ticks={ticks}
                  onToggle={handleToggle} onHold={(e, si2, ei2, k, t) => setHold({ ex: e, si: si2, ei: ei2, k, target: t })} />
              ))}
            </div>
          </div>
        ))}

        {/* day complete banner */}
        {dayComplete && (
          <div className="anim-fade" style={{ background: 'var(--ink)', color: 'var(--warm-white)',
            borderRadius: 'var(--r-lg)', padding: '18px 18px', marginTop: 4, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 4 }}>Day {day} complete</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>Logged on your calendar. Recover and refuel.</div>
            <button onClick={onBack} style={{ marginTop: 14, background: 'var(--warm-white)', color: 'var(--ink)',
              fontSize: 14, fontWeight: 600, padding: '11px 22px', borderRadius: 'var(--r-md)' }}>Back to calendar</button>
          </div>
        )}
      </div>

      {rest && <RestBar remaining={rest.remaining} total={rest.total}
        onAdjust={(dx) => setRest(r => ({ ...r, remaining: Math.max(0, r.remaining + dx), total: Math.max(r.total, r.remaining + dx) }))}
        onSkip={() => setRest(null)} />}

      {hold && <HoldTimer exName={hold.ex.name} setLabel={`Set ${hold.k + 1} of ${hold.ex.sets}`}
        target={hold.target} onLog={handleHoldLog} onClose={() => setHold(null)} />}
    </div>
  );
}

function MiniRing({ pct, done }) {
  const R = 13, C = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="38" height="38" viewBox="0 0 38 38" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="19" cy="19" r={R} fill="none" stroke="var(--paper-deep)" strokeWidth="3.5" />
        <circle cx="19" cy="19" r={R} fill="none" stroke={done ? 'var(--orange)' : 'var(--ink)'} strokeWidth="3.5"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset .3s' }} />
      </svg>
      <span className="tnum" style={{ position: 'absolute', fontSize: 9.5, fontWeight: 700,
        color: done ? 'var(--orange)' : 'var(--ink-2)' }}>{done ? '✓' : `${pct}`}</span>
    </div>
  );
}

/* ───────────────── Rest Day ───────────────── */
function RestDay({ day, onBack }) {
  const d = window.MYBAR.DAYS[day - 1];
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div className="screen anim-in" style={{ background: 'var(--paper)' }}>
      <div style={{ paddingTop: 'var(--safe-top)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 2,
          fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', padding: '8px 16px' }}>
          <Icon name="back" size={20} stroke="var(--ink-2)" />Calendar
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '0 40px 80px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1.6px solid var(--line-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}>
          <Icon name="moon" size={28} stroke="var(--ink-2)" sw={1.6} />
        </div>
        <div className="tnum" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Day {pad(day)} · {d.weekday}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 40, lineHeight: 1.1, margin: '14px 0 12px' }}>Rest day.<br />Recover well.</div>
        <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 260 }}>
          Muscle grows during recovery, not training. This day counts as complete — your streak is safe.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DayView, RestDay });
