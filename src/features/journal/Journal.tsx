import React, { useState } from "react";
import { Leaf, BookOpen, Plus } from "lucide-react";
import { db, compressPhoto, type Observation } from "../../db/repository";
import { missions } from "../../features/missions/engine";
import { candidates } from "../../ai/candidateCatalog";
import { useRecords, PageTitle, Photo, Modal } from "../../components/shared";
export function Journal() {
  const { observations, refresh, error } = useRecords();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Observation>();
  const [detail, setDetail] = useState<Observation>();
  const [message, setMessage] = useState("");
  function add() {
    setEditing({
      id: crypto.randomUUID(),
      title: "",
      notes: "",
      date: new Date().toISOString(),
      category: "Unknown / Not sure",
      missionId:
        new URLSearchParams(location.hash.split("?")[1]).get("mission") ||
        undefined,
    });
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await db.observations.put(editing);
      setEditing(undefined);
      await refresh();
    } catch {
      setMessage(
        "Could not save. Storage may be full. Export your journal before clearing browser data.",
      );
    }
  }
  async function remove(row: Observation) {
    if (
      !confirm(
        `Delete “${row.title}”? This cannot be undone. Export first to keep a copy.`,
      )
    )
      return;
    try {
      await db.observations.delete(row.id);
      setDetail(undefined);
      await refresh();
    } catch {
      setMessage("Delete failed. Please retry.");
    }
  }
  async function locate() {
    if (!navigator.geolocation) {
      setMessage("Location unavailable. You can enter a place name.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setEditing((r) =>
          r
            ? {
                ...r,
                location: `Approx. ${pos.coords.latitude.toFixed(1)}, ${pos.coords.longitude.toFixed(1)}`,
              }
            : r,
        ),
      () => setMessage("Location denied or unavailable. Continue without it."),
      { timeout: 10000, enableHighAccuracy: false },
    );
  }
  return (
    <>
      <PageTitle
        label="COLLECT MOMENTS, LEAVE FOOTPRINTS"
        title="Your nature journal"
        description="Little discoveries, kept close. Photos and notes live only in this browser."
      />
      <div className="journal-tools">
        <input
          aria-label="Search journal"
          placeholder="Search your discoveries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="button primary" onClick={add}>
          <Plus size={18} /> New observation
        </button>
      </div>
      {(error || message) && <p role="status">{error || message}</p>}
      {!observations.length ? (
        <section className="empty panel">
          <BookOpen size={44} />
          <h2>Your story starts outside.</h2>
          <p>Notice something small. Save your first discovery.</p>
          <button onClick={add}>Add an observation</button>
        </section>
      ) : (
        <div className="journal-grid">
          {observations
            .filter((r) =>
              `${r.title} ${r.notes} ${r.category}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((r) => (
              <button
                className="journal-card"
                key={r.id}
                onClick={() => setDetail(r)}
              >
                {r.photo ? (
                  <Photo blob={r.photo} />
                ) : (
                  <div className="journal-placeholder">
                    <Leaf size={40} />
                  </div>
                )}
                <div>
                  <span className="eyebrow">{r.category}</span>
                  <h3>{r.title}</h3>
                  <p>{r.notes.slice(0, 100)}</p>
                  <small>{new Date(r.date).toLocaleDateString()}</small>
                </div>
              </button>
            ))}
        </div>
      )}
      {detail && (
        <Modal close={() => setDetail(undefined)}>
          <h2>{detail.title}</h2>
          {detail.photo && <Photo blob={detail.photo} />}
          <p className="preserve">{detail.notes}</p>
          <p>
            {new Date(detail.date).toLocaleString()} · {detail.category}
          </p>
          {detail.location && <p>{detail.location}</p>}
          {detail.missionId && (
            <p>
              Mission:{" "}
              {missions.find((m) => m.id === detail.missionId)?.title ||
                detail.missionId}
            </p>
          )}
          {detail.suggestions?.map((s) => (
            <p key={s.label}>
              {s.label}: {s.similarity.toFixed(3)} cosine similarity
            </p>
          ))}
          <div className="button-row">
            <button
              onClick={() => {
                setEditing(detail);
                setDetail(undefined);
              }}
            >
              Edit
            </button>
            <button onClick={() => remove(detail)}>Delete</button>
            {!!navigator.share && (
              <button
                onClick={async () => {
                  try {
                    await navigator.share({
                      title: detail.title,
                      text: `${detail.title}\n${detail.notes}`,
                    });
                  } catch {
                    setMessage("Sharing cancelled or unavailable.");
                  }
                }}
              >
                Share note
              </button>
            )}
          </div>
        </Modal>
      )}
      {editing && (
        <Modal close={() => setEditing(undefined)}>
          <form onSubmit={save}>
            <h2>
              {observations.some((r) => r.id === editing.id)
                ? "Edit discovery"
                : "A new discovery"}
            </h2>
            <label>
              Title
              <input
                required
                maxLength={200}
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />
            </label>
            <label>
              Notes
              <textarea
                maxLength={10000}
                rows={4}
                value={editing.notes}
                onChange={(e) =>
                  setEditing({ ...editing, notes: e.target.value })
                }
              />
            </label>
            <label>
              Date
              <input
                type="date"
                required
                value={editing.date.slice(0, 10)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    date: e.target.value
                      ? new Date(`${e.target.value}T12:00:00`).toISOString()
                      : "",
                  })
                }
              />
            </label>
            <label>
              Category
              <select
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
              >
                {["Unknown / Not sure", ...candidates].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Approximate location (optional)
              <input
                maxLength={200}
                value={editing.location || ""}
                onChange={(e) =>
                  setEditing({ ...editing, location: e.target.value })
                }
              />
            </label>
            <button type="button" onClick={locate}>
              Use approximate location
            </button>
            <label>
              Photo (optional)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={async (e) => {
                  try {
                    const file = e.target.files?.[0];
                    if (file)
                      setEditing({
                        ...editing,
                        photo: await compressPhoto(file),
                      });
                  } catch (err) {
                    setMessage((err as Error).message);
                  }
                }}
              />
            </label>
            {message && <p role="alert">{message}</p>}
            <button className="button primary" type="submit">
              Save discovery
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
