import { useState } from "react";
import { Mountain, ArrowRight } from "lucide-react";
import { Modal } from "../../components/shared";
export function Onboarding({ done }: { done: () => void }) {
  const [step, setStep] = useState(0);
  const items = [
    [
      "A little less scrolling. A little more living.",
      "Welcome to TrailMate AI. Twenty gentle missions help you notice nature, anywhere. No location permission needed.",
    ],
    [
      "Your discoveries belong to you.",
      "Photos, notes and adventures stay on this device. No accounts, no tracking. Export your journal to keep a backup.",
    ],
    [
      "Pack once. Explore offline.",
      "Download AI explicitly in Settings while online: about 180 MB with runtime assets. Missions and journal need no model. Confirm airplane mode before heading out.",
    ],
  ];
  return (
    <Modal close={done}>
      <div className="onboarding">
        <span className="brand-icon">
          <Mountain size={32} />
        </span>
        <span className="eyebrow">
          EXPLORE MORE. SCROLL LESS. · {step + 1} / 3
        </span>
        <h2>{items[step][0]}</h2>
        <p>{items[step][1]}</p>
        <div className="button-row">
          <button
            className="button primary"
            onClick={() => (step < 2 ? setStep(step + 1) : done())}
          >
            {step < 2 ? "Next" : "Let’s explore"}
            <ArrowRight size={18} />
          </button>
          <button onClick={done}>Skip introduction</button>
        </div>
      </div>
    </Modal>
  );
}
