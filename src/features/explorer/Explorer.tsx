import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, BookOpen, ArrowRight, Camera } from "lucide-react";
import { db, compressPhoto, type Suggestion } from "../../db/repository";
import { candidates } from "../../ai/candidateCatalog";
import { PageTitle, Photo } from "../../components/shared";
export function Explorer() {
  const [photo, setPhoto] = useState<Blob>();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [category, setCategory] = useState("Unknown / Not sure");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const nav = useNavigate();
  async function choose(file?: File) {
    if (!file) return;
    setSuggestions([]);
    setCategory("Unknown / Not sure");
    try {
      setPhoto(await compressPhoto(file));
      setMessage("");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  async function run() {
    if (!photo) return;
    setBusy(true);
    setMessage("Running image and text embeddings on this device…");
    try {
      const { identify } = await import("../../ai/model");
      const result = await identify(photo);
      setSuggestions(result);
      setCategory(result[0].label);
      setMessage(
        "Local comparison complete. Similarities are not probabilities.",
      );
    } catch (e) {
      setMessage(
        `${(e as Error).message} Try Settings to download the model. Older or low-memory browsers may not support inference.`,
      );
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!photo) return;
    try {
      await db.observations.add({
        id: crypto.randomUUID(),
        title: `${category} observation`,
        notes: "",
        date: new Date().toISOString(),
        category,
        photo,
        suggestions,
      });
      nav("/journal");
    } catch {
      setMessage(
        "Storage full or unavailable. Export your journal before clearing space.",
      );
    }
  }
  return (
    <>
      <PageTitle
        label="PRIVATE BY NATURE"
        title="Meet your surroundings"
        description="A little help for your curiosity. Your photo never leaves this device."
      />
      <div className="two-columns">
        <section className="panel upload-panel">
          {photo ? (
            <Photo blob={photo} />
          ) : (
            <div className="upload-empty">
              <Camera size={48} />
              <h3>What caught your eye?</h3>
              <p>A leaf, a flower, a little mystery.</p>
            </div>
          )}
          <div className="button-row">
            <label className="button primary">
              Upload photo
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => choose(e.target.files?.[0])}
              />
            </label>
            <label className="button">
              Take photo
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => choose(e.target.files?.[0])}
              />
            </label>
          </div>
          <p className="muted">
            JPEG, PNG or WebP · up to 20 MB. Camera access is optional. Use
            upload if access is denied.
          </p>
          <button
            className="button primary"
            disabled={!photo || busy}
            onClick={run}
          >
            {busy ? "Exploring…" : "Explore with local AI"}
          </button>
        </section>
        <section className="panel">
          <Leaf className="feature-icon" />
          <h2>A suggestion, not an identification.</h2>
          <p>
            CLIP compares your image with {candidates.length} broad nature
            categories. It cannot reliably identify species or tell you what is
            safe.
          </p>
          {message && (
            <p role="status" className="notice">
              {message}
            </p>
          )}
          {suggestions.map((s) => (
            <div className="similarity" key={s.label}>
              <span>{s.label}</span>
              <strong>{s.similarity.toFixed(3)}</strong>
              <small>cosine similarity</small>
            </div>
          ))}
          <label>
            Choose your category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["Unknown / Not sure", ...candidates].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button className="button" disabled={!photo || busy} onClick={save}>
            Save observation <BookOpen size={17} />
          </button>
          <p className="safety">
            Observe from a distance. Never touch, eat, or collect unknown
            plants, mushrooms, or animals.
          </p>
          <Link to="/settings">
            Download AI for Offline Use <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </>
  );
}
