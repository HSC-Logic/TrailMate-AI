import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { X } from "lucide-react";
import { db, exportJournal, type Observation } from "../db/repository";
import { type Session } from "../features/missions/engine";
export function useRecords() {
  const [observations, setO] = useState<Observation[]>([]);
  const [sessions, setS] = useState<Session[]>([]);
  const [error, setE] = useState("");
  const refresh = async () => {
    try {
      setO(await db.observations.orderBy("date").reverse().toArray());
      setS(await db.sessions.toArray());
    } catch {
      setE(
        "Local storage is unavailable. Enable browser storage to save your adventures.",
      );
    }
  };
  useEffect(() => {
    void refresh();
  }, []);
  return { observations, sessions, refresh, error };
}

export function Stat({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="stat">
      {icon}
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}

export function PageTitle({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-title">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

export function Photo({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return <img className="photo" src={url} alt="Your nature observation" />;
}

export function Modal({
  children,
  close,
}: {
  children: React.ReactNode;
  close: () => void;
}) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useLayoutEffect(() => {
    const previous = document.activeElement as HTMLElement;
    document.querySelector<HTMLButtonElement>(".modal .close")?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const elements = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".modal button,.modal input,.modal textarea,.modal select,.modal a",
          ),
        ).filter((x) => !x.hasAttribute("disabled"));
        const first = elements[0],
          last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="TrailMate dialog"
      >
        <button className="close" aria-label="Close dialog" onClick={close}>
          <X />
        </button>
        {children}
      </section>
    </div>
  );
}

export async function downloadExport() {
  const text = await exportJournal();
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "trailmate-journal.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
