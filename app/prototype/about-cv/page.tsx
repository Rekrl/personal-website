import { Suspense } from "react";
import AboutCvPrototype from "./AboutCvPrototype";

// PROTOTYPE route for wayfinder ticket #22. Throwaway — not the real
// About/CV page. Lives at /prototype/about-cv?variant=A|B|C|D (D is
// the decided winner and the default).
export default function AboutCvPrototypePage() {
  return (
    <Suspense fallback={null}>
      <AboutCvPrototype />
    </Suspense>
  );
}
