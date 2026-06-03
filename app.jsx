/* MyBar — app root: state, persistence, streak/status, device mount */
const { useState: useApp, useEffect: useAppE, useRef: useAppR, useCallback: useAppCb } = React;

const LS_TICKS = 'mybar.ticks.v1';
const LS_START = 'mybar.start.v1';
const DAY_MS = 86400000;

function midnight(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }

function loadTicks() {
  try { return JSON.parse(localStorage.getItem(LS_TICKS)) || {}; } catch (e) { return {}; }
}
function loadStart() {
  let s = +localStorage.getItem(LS_START);
  if (!s) { s = midnight(Date.now()); localStorage.setItem(LS_START, String(s)); }
  return s;
}

// Align the program cycle to the user's actual start weekday.
// JS getDay(): 0=Sun..6=Sat → convert to Mon=0..Sun=6.
function alignWeekdaysToStart() {
  const startWeekdayMon0 = (new Date(loadStart()).getDay() + 6) % 7;
  window.MYBAR.rebuild(startWeekdayMon0);
}

function App() {
  // Rebuild DAYS for this user's start weekday before reading from MYBAR.
  // Cheap + idempotent, but only needs to happen once.
  if (!window.__mybarAligned) { alignWeekdaysToStart(); window.__mybarAligned = true; }

  const { DAYS, totalSets } = window.MYBAR;
  const [ticks, setTicks] = useApp(loadTicks);
  const [screen, setScreen] = useApp({ name: 'home' });
  const startRef = useAppR(loadStart());

  // current program day from real calendar (fresh start = Day 1)
  const currentDay = Math.min(60, Math.max(1,
    Math.floor((midnight(Date.now()) - startRef.current) / DAY_MS) + 1));

  useAppE(() => { localStorage.setItem(LS_TICKS, JSON.stringify(ticks)); }, [ticks]);

  const dayTicks = (day) => ticks[day] || {};
  const doneSetsOf = (day) => Object.values(dayTicks(day)).filter(Boolean).length;
  const isDayComplete = useAppCb((day) => {
    if (DAYS[day - 1].type === 'R') return true;
    const tot = totalSets(day);
    return tot > 0 && doneSetsOf(day) >= tot;
  }, [ticks]);

  const toggleSet = (day, si, ei, k, val) => {
    setTicks(prev => {
      const dt = { ...(prev[day] || {}) };
      const key = `${si}.${ei}.${k}`;
      if (val) dt[key] = true; else delete dt[key];
      return { ...prev, [day]: dt };
    });
  };

  const statusOf = (day) => {
    const t = DAYS[day - 1].type;
    if (t === 'R') return day <= currentDay ? 'past' : 'upcoming';
    if (isDayComplete(day)) return 'done';
    if (day === currentDay) return 'today';
    if (day < currentDay) return 'missed';
    return 'upcoming';
  };

  // streak: consecutive completed training days (rest neither breaks nor counts;
  // today incomplete does not break it yet)
  let streak = 0;
  for (let dd = currentDay; dd >= 1; dd--) {
    const t = DAYS[dd - 1].type;
    if (t === 'R') continue;
    if (isDayComplete(dd)) streak++;
    else if (dd === currentDay) continue;
    else break;
  }

  const completedCount = DAYS.filter(d => isDayComplete(d.day) && d.day <= currentDay).length;

  const openDay = (d) => {
    if (d.type === 'R') setScreen({ name: 'rest', day: d.day });
    else setScreen({ name: 'day', day: d.day });
  };
  const goHome = () => setScreen({ name: 'home' });

  return (
    <div className="mybar">
      {screen.name === 'home' && (
        <Home currentDay={currentDay} streak={streak} statusOf={statusOf}
          completedCount={completedCount} onOpenDay={openDay} />
      )}
      {screen.name === 'day' && (
        <DayView day={screen.day} ticks={dayTicks(screen.day)}
          onToggle={(si, ei, k, val) => toggleSet(screen.day, si, ei, k, val)}
          onBack={goHome}
          dayComplete={isDayComplete(screen.day)}
          totalSets={totalSets(screen.day)} doneSets={doneSetsOf(screen.day)} />
      )}
      {screen.name === 'rest' && (
        <RestDay day={screen.day} onBack={goHome} />
      )}
    </div>
  );
}

/* App fills the whole viewport — it IS the phone screen, no bezel. */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
