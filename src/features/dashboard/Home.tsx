import { Link } from "react-router-dom";
import {
  Leaf,
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  WifiOff,
  ShieldCheck,
  Clock,
  Check,
  Sun,
  Footprints,
} from "lucide-react";
import { useRecords, Stat } from "../../components/shared";
function Landscape() {
  return (
    <svg
      className="landscape"
      viewBox="0 0 680 440"
      role="img"
      aria-label="Original illustration of a quiet tropical mountain trail"
    >
      <defs>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stopColor="#d9e8bc" />
          <stop offset="1" stopColor="#94b996" />
        </linearGradient>
        <linearGradient id="hill" x2="0" y2="1">
          <stop stopColor="#508e71" />
          <stop offset="1" stopColor="#174b3a" />
        </linearGradient>
      </defs>
      <rect width="680" height="440" fill="url(#sky)" />
      <circle cx="493" cy="100" r="47" fill="#f3f1bb" />
      <path
        d="M0 243 123 128l87 86L354 54l145 182 86-88 95 80v212H0"
        fill="#779b81"
      />
      <path d="m269 159 85-105 61 77-48-16-31 29-20-10Z" fill="#c9d9b7" />
      <path d="M0 293Q165 161 325 285T680 259V440H0" fill="#3e785e" />
      <path d="M0 327q174-47 348 0t332-20v133H0" fill="url(#hill)" />
      <path
        d="M442 285q-157 45-69 82t-45 73h123q127-70 7-97t-16-58"
        fill="#bcc791"
      />
      <g fill="#174b3a">
        <path d="m66 141-43 131h86Z" />
        <path d="m112 194-36 105h72Z" />
        <path d="m583 140-53 163h106Z" />
        <path d="m629 184-37 129h74Z" />
      </g>
      <g fill="#102f29">
        <path d="m22 261-60 179H89Z" />
        <path d="m667 243-71 197h144Z" />
      </g>
      <path
        d="m478 151 9-4 9 4m22-22 8-4 9 4"
        fill="none"
        stroke="#315548"
        strokeWidth="3"
      />
      <g stroke="#89ae74" strokeWidth="3">
        <path d="m140 440-6-39m6 20-15-8m16 2 12-13m398 39 8-36m-6 22-13-9m16-6 12-10" />
      </g>
    </svg>
  );
}
export function Home() {
  const { observations, sessions, error } = useRecords();
  const complete = sessions.filter((s) => s.status === "completed");
  return (
    <>
      <div className="eyebrow">
        <Sun size={16} /> YOUR NEXT ADVENTURE IS OUTSIDE
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="pill">
            <Leaf size={14} /> Small steps. Wild discoveries.
          </span>
          <h1>
            Explore more.
            <br />
            <em>Scroll less.</em>
          </h1>
          <p>
            Trade your feed for a footpath. Discover little wonders, follow
            nature missions, and make room for the outdoors.
          </p>
          <Link className="button lime" to="/missions">
            Start an adventure <ArrowUpRight size={20} />
          </Link>
          <span className="hero-note">
            <ShieldCheck size={16} /> Your adventures stay yours. Always.
          </span>
        </div>
        <div className="hero-art">
          <Landscape />
          <span className="art-label">
            <i /> A WORLD WORTH NOTICING
          </span>
          <span className="art-caption">Find your own kind of wild.</span>
        </div>
      </section>
      {error && <p role="alert">{error}</p>}
      <div className="stats">
        <Stat
          value={complete.length}
          label="Missions completed"
          icon={<Check />}
        />
        <Stat
          value={observations.length}
          label="Little discoveries"
          icon={<Leaf />}
        />
        <Stat
          value={Math.floor(
            complete.reduce((n, s) => n + s.elapsedMs, 0) / 60000,
          )}
          label="Outdoor minutes · user-reported"
          icon={<Clock />}
        />
        <div className="stat stat-note">
          <ShieldCheck />
          <div>
            <strong>Just you & nature</strong>
            <small>No accounts. No tracking.</small>
          </div>
        </div>
      </div>
      <section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">MAKE A LITTLE ROOM FOR NATURE</span>
            <h2>Where will curiosity take you?</h2>
          </div>
          <Link to="/missions">
            All missions <ArrowRight size={17} />
          </Link>
        </div>
        <div className="action-grid">
          {[
            [
              "/missions",
              "01",
              "Nature missions",
              "A small challenge. A fresh perspective.",
              Footprints,
              "sage",
            ],
            [
              "/explorer",
              "02",
              "Meet your surroundings",
              "Explore a photo with private, local AI.",
              Leaf,
              "sand",
            ],
            [
              "/journal",
              "03",
              "Keep a little wonder",
              "Save the details you don’t want to forget.",
              BookOpen,
              "lavender",
            ],
          ].map(([url, n, title, desc, Icon, color]) => {
            const I = Icon as typeof Leaf;
            return (
              <Link
                to={url as string}
                className={`action-card ${color}`}
                key={url as string}
              >
                <div className="card-top">
                  <I size={28} />
                  <span>{n as string}</span>
                </div>
                <h3>{title as string}</h3>
                <p>{desc as string}</p>
                <span className="card-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="daily">
        <div className="daily-icon">
          <Leaf size={30} />
        </div>
        <div>
          <span className="eyebrow">A MOMENT OF WONDER</span>
          <h3>How many shades of green can you find?</h3>
          <p>
            Step outside. Look closely. Even a familiar leaf has something new
            to show you.
          </p>
        </div>
        <Link to="/missions" aria-label="Explore nature missions">
          <ArrowUpRight />
        </Link>
      </section>
      <div className="bottom-note">
        <WifiOff size={18} />
        <p>
          Adventure beyond the signal.
          <span>Download your AI once. Take your curiosity anywhere.</span>
        </p>
        <Link to="/settings">
          Get offline ready <ArrowRight size={16} />
        </Link>
      </div>
    </>
  );
}
