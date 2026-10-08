import React, { useEffect, useState } from "react";
import { ArrowUpRight, WifiOff, Download, Clock, Check } from "lucide-react";
import { db, importJournal } from "../../db/repository";
import { PageTitle, downloadExport } from "../../components/shared";
export function Settings() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState(false);
  const [shell, setShell] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  async function status() {
    try {
      setModel(await (await import("../../ai/model")).modelCached());
      const names = await caches.keys();
      const shellNames = names.filter((n) => n.startsWith("workbox-precache"));
      let ready = false;
      for (const name of shellNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        if (keys.some((k) => new URL(k.url).pathname.endsWith("/index.html")))
          ready = true;
      }
      setShell(ready && !!navigator.serviceWorker.controller);
    } catch {
      setMessage("Cache storage unavailable in this browser.");
    }
  }
  useEffect(() => {
    void status();
    window.addEventListener("shell-ready", status);
    return () => window.removeEventListener("shell-ready", status);
  }, []);
  async function prepare() {
    setBusy(true);
    try {
      await (await import("../../ai/model")).prepareModel(setMessage);
      await status();
      await navigator.storage?.persist?.();
    } catch (e) {
      setMessage(
        `${(e as Error).message} Partial downloads remain cached; retry. Allow storage and use a recent browser with enough memory.`,
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        label="YOUR ADVENTURE, YOUR TERMS"
        title="Settings & offline preparation"
        description="Get ready before you leave the signal behind."
      />
      <div className="two-columns">
        <section className="panel">
          <Download className="feature-icon" />
          <h2>Pack your offline AI</h2>
          <p>
            First run needs internet. CLIP weights: about 154 MB, plus tokenizer
            and about 25 MB of WASM runtime. Allow at least 250 MB storage;
            inference needs additional device memory.
          </p>
          <ul className="readiness">
            <li>
              {shell ? <Check /> : <Clock />} App shell:{" "}
              {shell
                ? "cached and controlled"
                : "not verified yet; reload after installation"}
            </li>
            <li>
              {model ? <Check /> : <Clock />} AI artifacts:{" "}
              {model ? "all required files cached" : "download required"}
            </li>
            <li>
              {shell && model ? <Check /> : <WifiOff />}{" "}
              {shell && model
                ? "Resources cached. Confirm inference in airplane mode."
                : "Offline preparation incomplete"}
            </li>
          </ul>
          <button className="button primary" disabled={busy} onClick={prepare}>
            {busy ? "Preparing…" : "Download AI for Offline Use"}
          </button>
          {message && (
            <p role="status" className="notice">
              {message}
            </p>
          )}
          <button
            disabled={busy}
            onClick={async () => {
              if (
                confirm(
                  "Remove downloaded AI? You will need internet to download it again.",
                )
              ) {
                await (await import("../../ai/model")).clearModel();
                await status();
              }
            }}
          >
            Remove AI cache
          </button>
          <p className="muted">
            WASM CPU inference works without WebGPU. Large models can fail on
            low-memory devices. Browser caches may be evicted; check before each
            trip.
          </p>
        </section>
        <section className="panel">
          <h2>Make yourself at home</h2>
          <label>
            Appearance
            <select
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value);
                localStorage.setItem("theme", e.target.value);
                window.dispatchEvent(new Event("theme"));
              }}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <h3>Your local journal</h3>
          <p>
            Export includes photos. Imports add new entries; duplicate IDs are
            rejected without overwriting your data.
          </p>
          <div className="button-row">
            <button
              onClick={() =>
                downloadExport().catch(() =>
                  setMessage("Export failed. Storage may be unavailable."),
                )
              }
            >
              Export journal
            </button>
            <label className="button">
              Import journal
              <input
                className="sr-only"
                type="file"
                accept="application/json,.json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    if (file.size > 30_000_000)
                      throw Error("Import must be under 30 MB.");
                    await importJournal(await file.text());
                    setMessage("Journal imported.");
                  } catch (err) {
                    setMessage((err as Error).message);
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <h3>Private by nature</h3>
          <p>
            No accounts, analytics, tracking, photo uploads, or cloud AI. Model
            downloads contact Hugging Face; hosting serves the app. Location is
            optional and rounded to one decimal place. Sharing happens only when
            you request it.
          </p>
          <p>
            Browser data can be cleared by you or your device. Exports are your
            backup. Reduced motion follows your system preference.
          </p>
          <button
            className="danger"
            disabled={busy}
            onClick={async () => {
              if (
                !confirm(
                  "Permanently clear ALL journal entries, mission progress, preferences and downloaded AI? Export first. This cannot be undone.",
                )
              )
                return;
              try {
                await db.transaction(
                  "rw",
                  db.observations,
                  db.sessions,
                  async () => {
                    await db.observations.clear();
                    await db.sessions.clear();
                  },
                );
                await (await import("../../ai/model")).clearModel();
                localStorage.clear();
                location.reload();
              } catch {
                setMessage("Could not clear all data. Retry.");
              }
            }}
          >
            Clear all local data
          </button>
        </section>
      </div>
      <section className="panel about">
        <h2>Open trails. Open source.</h2>
        <p>
          TrailMate AI · MIT code. React (MIT), Transformers.js (Apache-2.0),
          ONNX Runtime (MIT), CLIP (MIT), Dexie (Apache-2.0), Lucide (ISC). See
          repository documentation for exact model provenance and limitations.
        </p>
        <a
          href="https://github.com/HSC-Logic/TrailMate-AI"
          target="_blank"
          rel="noreferrer"
        >
          Explore the source <ArrowUpRight size={16} />
        </a>
      </section>
    </>
  );
}
