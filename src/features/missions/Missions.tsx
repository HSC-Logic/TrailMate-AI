import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, ArrowRight, Clock } from "lucide-react";
import { db } from "../../db/repository";
import { missions, elapsed, transition } from "../../features/missions/engine";
import { useRecords, PageTitle } from "../../components/shared";
export function Missions() {
  const { sessions, refresh, error } = useRecords();
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(Date.now());
  const [vibrate, setVibrate] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const active = sessions.find(
    (s) => s.status === "active" || s.status === "paused",
  );
  const mission = missions.find((m) => m.id === active?.missionId);
  async function start(id: string) {
    try {
      await db.transaction("rw", db.sessions, async () => {
        const existing = await db.sessions
          .where("status")
          .anyOf("active", "paused")
          .first();
        if (existing) return;
        await db.sessions.add({
          id: crypto.randomUUID(),
          missionId: id,
          startedAt: Date.now(),
          runningSince: Date.now(),
          elapsedMs: 0,
          status: "active",
        });
      });
      await refresh();
    } catch {
      setMessage("Could not save session. Check browser storage.");
    }
  }
  async function act(action: "pause" | "resume" | "complete" | "cancel") {
    if (!active) return;
    if (
      action === "complete" &&
      !confirm(
        "Confirm you completed this activity? Outdoor time is self-reported.",
      )
    )
      return;
    if (
      action === "cancel" &&
      !confirm("Cancel this session? It will not count toward progress.")
    )
      return;
    try {
      await db.sessions.put(transition(active, action));
      await refresh();
      if (action === "complete") {
        if (vibrate && navigator.vibrate) navigator.vibrate(150);
        setMessage("Adventure complete. Save a journal entry to remember it.");
      }
    } catch {
      setMessage("Session could not be saved. Retry before closing.");
    }
  }
  return (
    <>
      <PageTitle
        label="GO OUT. LOOK CLOSER."
        title="Nature missions"
        description="Twenty small invitations to explore. No GPS. No race. Just a little curiosity."
      />
      {(error || message) && <p role="status">{error || message}</p>}
      {active && mission ? (
        <section className="session panel">
          <span className="eyebrow">SCREEN-FREE MODE · {active.status}</span>
          <h2>{mission.title}</h2>
          <div className="timer" aria-label="Elapsed time">
            {Math.floor(elapsed(active, now) / 60000)
              .toString()
              .padStart(2, "0")}
            :
            {Math.floor((elapsed(active, now) / 1000) % 60)
              .toString()
              .padStart(2, "0")}
          </div>
          <ol>
            {mission.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p>{mission.safety}</p>
          <p className="muted">
            Put your phone away. Timestamps survive reloads and sleep; live
            notifications may stop when your device sleeps.
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={vibrate}
              onChange={(e) => setVibrate(e.target.checked)}
            />{" "}
            Vibrate on finish, if supported
          </label>
          <div className="button-row">
            <button
              onClick={() =>
                act(active.status === "active" ? "pause" : "resume")
              }
            >
              {active.status === "active" ? "Pause" : "Resume"}
            </button>
            <button className="button primary" onClick={() => act("complete")}>
              Finish & confirm
            </button>
            <button onClick={() => act("cancel")}>Cancel</button>
            <button onClick={() => nav(`/journal?mission=${mission.id}`)}>
              Attach journal entry
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="filters" aria-label="Mission category">
            {["All", "Plants", "Wildlife", "Mindfulness", "Walking"].map(
              (c) => (
                <button
                  className={filter === c ? "selected" : ""}
                  key={c}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </button>
              ),
            )}
          </div>
          <div className="mission-grid">
            {missions
              .filter((m) => filter === "All" || m.category === filter)
              .map((m, i) => (
                <article className="mission-card" key={m.id}>
                  <div className={`mission-art art-${i % 4}`}>
                    <Leaf size={48} />
                    <span>{m.category}</span>
                  </div>
                  <div className="mission-content">
                    <span className="muted">
                      <Clock size={14} /> {m.duration} min · {m.difficulty}
                    </span>
                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                    <details>
                      <summary>Steps & safety</summary>
                      <ol>
                        {m.steps.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                      <p>{m.safety}</p>
                    </details>
                    <button
                      className="start-mission"
                      onClick={() => start(m.id)}
                    >
                      Start mission <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </>
      )}
    </>
  );
}
