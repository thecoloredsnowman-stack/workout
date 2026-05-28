/* global React, ReactDOM, PROGRAM, BLOCKS, typeForDay, blockForDay */
const { useState, useEffect, useMemo, useCallback, useRef } = React;

// ───────────────────────────────────────────────────────────
// Storage helpers
// ───────────────────────────────────────────────────────────
const STORAGE_KEY = "mybar.v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function daysBetween(a, b) {
  return Math.floor((startOfDay(b) - startOfDay(a)) / 86400000);
}

function defaultState() {
  return {
    startDate: new Date().toISOString(),
    completions: {}, // { [day]: { [exIdx]: [bool,bool,bool] } }
    // demo: optional flag we set when user opts to pre-fill some days for screenshot purposes
  };
}

// ───────────────────────────────────────────────────────────
// Derived helpers
// ───────────────────────────────────────────────────────────
function todayDayNumber(state) {
  const diff = daysBetween(new Date(state.startDate), new Date());
  return Math.min(Math.max(diff + 1, 1), 60);
}

function isDayComplete(state, day) {
  const plan = PROGRAM[day - 1];
  if (!plan) return false;
  const today = todayDayNumber(state);
  // Rest day auto-completes once it has been reached.
  if (plan.type === "R") return day <= today;
  const c = state.completions[day];
  if (!c) return false;
  return plan.exercises.every((ex, i) => {
    const arr = c[i] || [];
    return arr.length >= ex.sets && arr.slice(0, ex.sets).every(Boolean);
  });
}

function isDayMissed(state, day) {
  const today = todayDayNumber(state);
  if (day >= today) return false;
  return !isDayComplete(state, day);
}

function streakCount(state) {
  // Consecutive completed days ending at today (rest days count, missed non-rest break the streak).
  const today = todayDayNumber(state);
  let count = 0;
  for (let d = today; d >= 1; d--) {
    const plan = PROGRAM[d - 1];
    if (plan.type === "R") {
      // Rest day: doesn't break, doesn't add. Skip.
      continue;
    }
    if (isDayComplete(state, d)) count++;
    else if (d === today) continue; // today not done yet — keep streak from yesterday
    else break;
  }
  return count;
}

function totalSetsCompleted(state) {
  let s = 0;
  for (const day in state.completions) {
    for (const ex in state.completions[day]) {
      s += (state.completions[day][ex] || []).filter(Boolean).length;
    }
  }
  return s;
}

function completedDaysCount(state) {
  let c = 0;
  for (let d = 1; d <= 60; d++) if (isDayComplete(state, d)) c++;
  return c;
}

// ───────────────────────────────────────────────────────────
// Icons (inline SVG, monochrome, current-color)
// ───────────────────────────────────────────────────────────
const I = {
  flame: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c4.4 0 8-3.5 8-7.8 0-3.4-2-5.5-3.5-7.2-1.3-1.5-1.7-3.5-1.2-5C12 3 7 6 7 11c0 1.5 1 2.5 1 2.5C6 14 4 16 4 18.5 4 20.5 6 22 12 22Z"/></svg>,
  today: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>,
  cal:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  stats: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 19V11M12 19V5M19 19v-6"/></svg>,
  notes: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h14v14l-4 3v-3H5z"/><path d="M9 9h8M9 13h5"/></svg>,
  back:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>,
  zzz:   <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>,
  play:  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 5v14l12-7z"/></svg>,
};

// ───────────────────────────────────────────────────────────
// Day-type badge
// ───────────────────────────────────────────────────────────
function Badge({ type, sm }) {
  return <span className={`badge ${type}${sm ? " sm" : ""}`}>{type}</span>;
}

function typeLabel(t) {
  if (t === "A") return "Push + Legs";
  if (t === "B") return "Pull + Core";
  return "Rest";
}

// ───────────────────────────────────────────────────────────
// Streak pill
// ───────────────────────────────────────────────────────────
function StreakPill({ count }) {
  return (
    <div className="streak" title="Current streak">
      <span className="streak-dot"></span>
      <span className="mono">{count}</span>
      <span style={{ color: "var(--text-2)", fontWeight: 500 }}>day{count === 1 ? "" : "s"}</span>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Today screen
// ───────────────────────────────────────────────────────────
function TodayScreen({ state, onOpenDay }) {
  const today = todayDayNumber(state);
  const plan = PROGRAM[today - 1];
  const block = BLOCKS.find((b) => b.id === plan.block);
  const done = isDayComplete(state, today);
  const totalSets = plan.exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = plan.exercises.reduce((a, e, i) => {
    const arr = (state.completions[today] || {})[i] || [];
    return a + arr.slice(0, e.sets).filter(Boolean).length;
  }, 0);
  const completedDays = completedDaysCount(state);

  return (
    <div className="page stack-16">
      <header className="top">
        <div>
          <h1>Today</h1>
          <div className="sub">{block.name} · Block {block.id} of 4</div>
        </div>
        <StreakPill count={streakCount(state)} />
      </header>

      <section className="today-hero">
        <div className="row between">
          <div className="label">Day {today} of 60</div>
          <Badge type={plan.type} />
        </div>

        <div className="day-row">
          <div className="daynum mono">{today}</div>
          <div className="of">/ 60</div>
        </div>

        <div className="title">{typeLabel(plan.type)}</div>
        {plan.type !== "R" ? (
          <div className="sub-title">
            {plan.exercises.length} exercises · {totalSets} sets
            {doneSets > 0 && !done ? <> · <span style={{ color: "#fff" }}>{doneSets}/{totalSets} done</span></> : null}
          </div>
        ) : (
          <div className="sub-title">Recover. No exercises today.</div>
        )}

        {plan.type === "R" ? (
          <button className="cta secondary" onClick={() => onOpenDay(today)}>Open rest day</button>
        ) : done ? (
          <button className="cta" onClick={() => onOpenDay(today)}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {I.check} Review workout
            </span>
          </button>
        ) : (
          <button className="cta" onClick={() => onOpenDay(today)}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {I.play} {doneSets > 0 ? "Continue workout" : "Start workout"}
            </span>
          </button>
        )}
      </section>

      <section className="card">
        <div className="row between" style={{ marginBottom: 4 }}>
          <div className="card-title">60-day program</div>
          <div className="muted" style={{ fontSize: 12 }}>
            <span className="mono" style={{ color: "#fff", fontWeight: 600 }}>{completedDays}</span> / 60 done
          </div>
        </div>
        <Constellation state={state} onTap={onOpenDay} />
        <div className="row" style={{ marginTop: 14, gap: 16, fontSize: 11, color: "var(--text-2)", justifyContent: "space-between" }}>
          <Legend swatch="done" label="Done" />
          <Legend swatch="today" label="Today" />
          <Legend swatch="rest" label="Rest" />
          <Legend swatch="missed" label="Missed" />
          <Legend swatch="upcoming" label="Upcoming" />
        </div>
      </section>
    </div>
  );
}

function Legend({ swatch, label }) {
  let cls = "cdot";
  if (swatch === "done") cls += " done";
  else if (swatch === "today") cls += " today";
  else if (swatch === "rest") cls += " rest";
  else if (swatch === "missed") cls += " missed";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span className={cls} style={{ width: 8, height: 8 }}></span>
      <span>{label}</span>
    </span>
  );
}

function Constellation({ state, onTap }) {
  const today = todayDayNumber(state);
  return (
    <div className="constellation">
      {PROGRAM.map((p) => {
        const done = isDayComplete(state, p.day);
        const missed = isDayMissed(state, p.day);
        let cls = "cdot";
        if (p.type === "R") cls += " rest";
        if (done) cls += " done";
        if (p.day === today) cls += " today";
        if (missed) cls += " missed";
        return (
          <button
            key={p.day}
            className={cls}
            onClick={() => onTap(p.day)}
            aria-label={`Day ${p.day} ${typeLabel(p.type)}`}
          />
        );
      })}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Calendar screen — month grid
// ───────────────────────────────────────────────────────────
function CalendarScreen({ state, onOpenDay }) {
  const [month, setMonth] = useState(() => {
    const t = todayDayNumber(state);
    return t > 30 ? 2 : 1;
  });
  const today = todayDayNumber(state);
  const range = month === 1 ? [1, 30] : [31, 60];
  const days = PROGRAM.slice(range[0] - 1, range[1]);

  return (
    <div className="page stack-16">
      <header className="top">
        <div>
          <h1>Calendar</h1>
          <div className="sub">Day {today} · {BLOCKS.find(b => b.id === blockForDay(today)).name}</div>
        </div>
        <StreakPill count={streakCount(state)} />
      </header>

      <section>
        <div className="cal-header">
          <div className="card-title">{month === 1 ? "Days 1 – 30" : "Days 31 – 60"}</div>
          <div className="cal-tabs">
            <button className={month === 1 ? "active" : ""} onClick={() => setMonth(1)}>Month 1</button>
            <button className={month === 2 ? "active" : ""} onClick={() => setMonth(2)}>Month 2</button>
          </div>
        </div>
        <div className="cal-grid">
          {days.map((p) => {
            const done = isDayComplete(state, p.day);
            const missed = isDayMissed(state, p.day);
            const isToday = p.day === today;
            const future = p.day > today;
            let cls = "cal-cell";
            if (p.type === "R") cls += " rest";
            if (done) cls += " done";
            if (isToday) cls += " today";
            if (future) cls += " future";
            if (missed) cls += " missed";
            return (
              <button key={p.day} className={cls} onClick={() => onOpenDay(p.day)}>
                <span className="block-dot" style={{
                  background: `rgba(255,255,255,${0.1 + p.block * 0.08})`
                }}></span>
                <span className="n mono">{p.day}</span>
                <span className="t">{p.type}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card tight">
        <div className="card-title" style={{ marginBottom: 10 }}>Blocks</div>
        <div className="block-list">
          {BLOCKS.map((b) => {
            const current = today >= b.days[0] && today <= b.days[1];
            return (
              <div key={b.id} className={`block-row${current ? " current" : ""}`}>
                <div>
                  <div className="bk">{b.id}. {b.name}</div>
                  <div className="bk-meta">{b.intent}</div>
                </div>
                <div className="bk-days mono">{b.days[0]}–{b.days[1]}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Day view (workout)
// ───────────────────────────────────────────────────────────
function DayView({ state, day, onBack, onToggleSet }) {
  const plan = PROGRAM[day - 1];
  if (plan.type === "R") return <RestView day={day} onBack={onBack} />;

  const completion = state.completions[day] || {};
  const block = BLOCKS.find((b) => b.id === plan.block);
  const totalSets = plan.exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = plan.exercises.reduce((a, e, i) => {
    const arr = completion[i] || [];
    return a + arr.slice(0, e.sets).filter(Boolean).length;
  }, 0);
  const pct = totalSets ? doneSets / totalSets : 0;
  const today = todayDayNumber(state);

  return (
    <div className="page">
      <div className="dayview-top">
        <button className="back-btn" onClick={onBack} aria-label="Back">{I.back}</button>
        <div className="grow">
          <h2>Day {day}</h2>
          <div className="meta">{typeLabel(plan.type)} · {block.name}{day === today ? " · Today" : ""}</div>
        </div>
        <Badge type={plan.type} />
      </div>

      <div className="day-hero">
        <ProgressRing pct={pct} />
        <div className="grow">
          <h3>{doneSets === totalSets ? "Workout complete" : `${doneSets} of ${totalSets} sets`}</h3>
          <div className="meta">{plan.exercises.length} exercises · tap a set to mark it done</div>
        </div>
      </div>

      <div className="stack-12">
        {plan.exercises.map((ex, i) => {
          const arr = completion[i] || [];
          const doneCount = arr.slice(0, ex.sets).filter(Boolean).length;
          const exDone = doneCount === ex.sets;
          return (
            <div key={i} className={`exercise${exDone ? " done" : ""}`}>
              <div className="ex-head">
                <div className="grow">
                  <div className="ex-num">{String(i + 1).padStart(2, "0")}</div>
                  <h4>{ex.name}</h4>
                  <div className="reps mono">{ex.sets} × {ex.reps}</div>
                </div>
                {exDone ? (
                  <div style={{ color: "#fff", display: "inline-flex", width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(255,255,255,0.18)" }}>
                    {React.cloneElement(I.check, { width: 16, height: 16 })}
                  </div>
                ) : null}
              </div>
              <div className="note">{ex.note}</div>
              <div className="sets-row" role="group" aria-label={`${ex.name} sets`}>
                {Array.from({ length: ex.sets }).map((_, s) => {
                  const checked = !!arr[s];
                  return (
                    <button
                      key={s}
                      className={`set-pill${checked ? " checked" : ""}`}
                      onClick={() => onToggleSet(day, i, s, ex.sets)}
                      aria-pressed={checked}
                    >
                      <span className="set-label">SET</span>{s + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressRing({ pct }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} stroke="rgba(255,255,255,0.12)" strokeWidth="5" fill="none"/>
        <circle cx="32" cy="32" r={r} stroke="#fff" strokeWidth="5" fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 280ms ease" }}
        />
      </svg>
      <div className="pct mono">{Math.round(pct * 100)}</div>
    </div>
  );
}

function RestView({ day, onBack }) {
  return (
    <div className="page">
      <div className="dayview-top">
        <button className="back-btn" onClick={onBack} aria-label="Back">{I.back}</button>
        <div className="grow">
          <h2>Day {day}</h2>
          <div className="meta">Rest day</div>
        </div>
        <Badge type="R" />
      </div>
      <div className="rest-screen">
        <div className="glyph">{I.zzz}</div>
        <h2>Rest day.</h2>
        <p>Recover well. Sleep, eat, stretch lightly if you want. The bar will be there tomorrow.</p>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Stats screen
// ───────────────────────────────────────────────────────────
function StatsScreen({ state }) {
  const today = todayDayNumber(state);
  const completed = completedDaysCount(state);
  const sets = totalSetsCompleted(state);
  const streak = streakCount(state);
  const remaining = 60 - today + 1;
  const pct = Math.round((completed / 60) * 100);

  // Per-block stats
  const perBlock = BLOCKS.map((b) => {
    let done = 0;
    let total = 0;
    for (let d = b.days[0]; d <= b.days[1]; d++) {
      const plan = PROGRAM[d - 1];
      if (plan.type === "R") continue;
      total++;
      if (isDayComplete(state, d)) done++;
    }
    return { ...b, done, total };
  });

  return (
    <div className="page stack-16">
      <header className="top">
        <div>
          <h1>Stats</h1>
          <div className="sub">Your 60-day program at a glance</div>
        </div>
        <StreakPill count={streak} />
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="v mono">{completed}<span className="unit">/ 60</span></div>
          <div className="k">Days completed</div>
        </div>
        <div className="stat-card">
          <div className="v mono">{pct}<span className="unit">%</span></div>
          <div className="k">Program done</div>
        </div>
        <div className="stat-card">
          <div className="v mono">{sets}</div>
          <div className="k">Total sets logged</div>
        </div>
        <div className="stat-card">
          <div className="v mono">{streak}</div>
          <div className="k">Current streak</div>
        </div>
      </div>

      <section className="card tight">
        <div className="card-title" style={{ marginBottom: 12 }}>Block progress</div>
        <div className="block-list">
          {perBlock.map((b) => {
            const current = today >= b.days[0] && today <= b.days[1];
            const pct = b.total ? Math.round((b.done / b.total) * 100) : 0;
            return (
              <div key={b.id} className={`block-row${current ? " current" : ""}`}>
                <div className="grow">
                  <div className="bk">{b.id}. {b.name}</div>
                  <div className="bk-meta">Days {b.days[0]}–{b.days[1]} · {b.done}/{b.total} workouts</div>
                  <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "#fff", transition: "width 300ms ease" }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card tight">
        <div className="card-title" style={{ marginBottom: 4 }}>Reset</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>
          Wipes every set you've ticked and restarts the program from day 1, today.
        </div>
        <button
          style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, background: "var(--surface-2)", color: "#fff", fontSize: 14, fontWeight: 600 }}
          onClick={() => {
            if (confirm("Reset all progress and restart from Day 1 today?")) {
              saveState(defaultState());
              location.reload();
            }
          }}
        >Reset program</button>
      </section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Notes screen (small — exercise library reference)
// ───────────────────────────────────────────────────────────
function NotesScreen() {
  return (
    <div className="page stack-16">
      <header className="top">
        <div>
          <h1>Notes</h1>
          <div className="sub">Form cues & safety</div>
        </div>
      </header>

      <section className="card tight">
        <div className="card-title" style={{ marginBottom: 10 }}>Bar grip</div>
        <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
          Use gloves for chin-ups and pull-ups in Blocks 1–2. Reduce gradually in 3–4 to build natural grip.
        </p>
      </section>

      <section className="card tight">
        <div className="card-title" style={{ marginBottom: 10 }}>Knees</div>
        <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
          Jump squats — land soft, bend knees on impact. Bulgarian split squat — rear knee tap, never slam.
        </p>
      </section>

      <section className="card tight">
        <div className="card-title" style={{ marginBottom: 10 }}>Quality over reps</div>
        <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
          Three clean pull-ups beats seven ugly ones. If a variation is too hard, drop reps — not sets.
        </p>
      </section>

      <section className="card tight">
        <div className="card-title" style={{ marginBottom: 10 }}>Rest days</div>
        <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
          Mandatory. Do not skip rest days to catch up. Adaptation happens during recovery, not training.
        </p>
      </section>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Tab bar
// ───────────────────────────────────────────────────────────
function TabBar({ tab, setTab }) {
  const items = [
    { id: "today", icon: I.today, label: "Today" },
    { id: "cal",   icon: I.cal,   label: "Calendar" },
    { id: "stats", icon: I.stats, label: "Stats" },
    { id: "notes", icon: I.notes, label: "Notes" },
  ];
  return (
    <nav className="tabbar" role="tablist">
      {items.map((it) => (
        <button key={it.id} className={tab === it.id ? "active" : ""} onClick={() => setTab(it.id)} aria-label={it.label}>
          {it.icon}
        </button>
      ))}
    </nav>
  );
}

// ───────────────────────────────────────────────────────────
// Root
// ───────────────────────────────────────────────────────────
function App() {
  const [state, setState] = useState(() => loadState() || defaultState());
  const [tab, setTab] = useState("today");
  const [openDay, setOpenDay] = useState(null);

  useEffect(() => { saveState(state); }, [state]);

  const handleToggleSet = useCallback((day, exIdx, setIdx, setsTotal) => {
    setState((prev) => {
      const next = { ...prev, completions: { ...prev.completions } };
      const dayC = { ...(next.completions[day] || {}) };
      const arr = (dayC[exIdx] || []).slice();
      while (arr.length < setsTotal) arr.push(false);
      arr[setIdx] = !arr[setIdx];
      dayC[exIdx] = arr;
      next.completions[day] = dayC;
      return next;
    });
  }, []);

  const handleOpenDay = useCallback((day) => setOpenDay(day), []);
  const handleBack = useCallback(() => setOpenDay(null), []);

  let screen;
  if (openDay !== null) {
    screen = <DayView state={state} day={openDay} onBack={handleBack} onToggleSet={handleToggleSet} />;
  } else if (tab === "today") screen = <TodayScreen state={state} onOpenDay={handleOpenDay} />;
  else if (tab === "cal")     screen = <CalendarScreen state={state} onOpenDay={handleOpenDay} />;
  else if (tab === "stats")   screen = <StatsScreen state={state} />;
  else if (tab === "notes")   screen = <NotesScreen />;

  return (
    <div className="app">
      {screen}
      {openDay === null ? <TabBar tab={tab} setTab={setTab} /> : null}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
