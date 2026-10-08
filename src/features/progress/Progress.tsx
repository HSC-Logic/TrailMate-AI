import { Leaf, BookOpen, Clock, Check } from "lucide-react";
import { useRecords, Stat, PageTitle } from "../../components/shared";
export function Progress() {
  const { sessions, observations, error } = useRecords();
  const completed = sessions.filter((s) => s.status === "completed");
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6 + i);
    return {
      date,
      count: completed.filter(
        (s) =>
          s.completedAt &&
          new Date(s.completedAt).toDateString() === date.toDateString(),
      ).length,
    };
  });
  return (
    <>
      <PageTitle
        label="EVERY LITTLE ADVENTURE COUNTS"
        title="More moments outside"
        description="A quiet look at your journey. No streaks to protect. No pressure to keep up."
      />
      {error && <p role="alert">{error}</p>}
      <div className="stats">
        <Stat
          value={completed.length}
          label="Confirmed missions"
          icon={<Check />}
        />
        <Stat
          value={Math.floor(
            completed.reduce((n, s) => n + s.elapsedMs, 0) / 60000,
          )}
          label="Outdoor minutes · user-reported"
          icon={<Clock />}
        />
        <Stat
          value={observations.length}
          label="Observations"
          icon={<BookOpen />}
        />
      </div>
      <section className="panel">
        <h2>Your week in nature</h2>
        <p className="muted">
          Completed missions. Time is user-reported, never GPS-verified.
        </p>
        <div
          className="week-chart"
          role="img"
          aria-label={days
            .map((d) => `${d.date.toLocaleDateString()}: ${d.count} missions`)
            .join(", ")}
        >
          {days.map((d) => (
            <div key={d.date.toISOString()}>
              <strong>{d.count}</strong>
              <span
                style={{
                  height: `${Math.max(4, (d.count / Math.max(1, ...days.map((x) => x.count))) * 120)}px`,
                }}
              />
              <small>
                {d.date.toLocaleDateString(undefined, { weekday: "short" })}
              </small>
            </div>
          ))}
        </div>
      </section>
      <section className="daily">
        <Leaf />
        <div>
          <h3>
            {completed.length >= 5
              ? "Five adventures. A growing collection of moments."
              : completed.length
                ? "Your first steps are worth remembering."
                : "Your first little adventure is waiting."}
          </h3>
          <p>Go at your own pace. Nature will be there.</p>
        </div>
      </section>
    </>
  );
}
