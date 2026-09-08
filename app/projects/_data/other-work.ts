import type { OtherWork } from "./types";

// The "also built" list. Contents and copy decided in issue #9; the
// expand-on-click detail comes from issue #8 (no case study page to link to).

export const otherWork: OtherWork[] = [
  {
    name: "Cartógrafo",
    blurb:
      "University AI project — route-finding across 18 Portuguese cities with four graph-search algorithms, licence-plate login via OCR, and a local LLM narrating each city's sights.",
    stack: ["Python", "Streamlit", "EasyOCR", "Ollama / Mistral 7B", "OSRM"],
    signatureStack: ["Python", "EasyOCR", "Ollama / Mistral 7B"],
    status: "shipped",
    expandedDetail: [
      "Built for an Artificial Intelligence course; I was the lead contributor. The user authenticates by photographing their vehicle's licence plate — EasyOCR runs a three-variant preprocessing pipeline with four validation strategies — then the app plans a route with uniform-cost, depth-limited, greedy or A* search over a weighted graph of cities.",
      "The A* heuristic is straight-line (Haversine) distance, which is admissible — it never overestimates — so A* is guaranteed optimal. Routes are drawn on real cartography with OSRM road routing, and Ollama running Mistral 7B locally (no internet) writes a short description of each city's attractions along the way.",
    ],
  },
  {
    name: "Company website — Tek4You",
    blurb:
      "Company website built from scratch during a curricular internship — product catalogue, contact form, and a WhatsApp API integration for automated client messaging.",
    stack: ["PHP", "MySQL", "JavaScript", "WhatsApp API"],
    signatureStack: ["PHP", "WhatsApp API"],
    status: "shipped",
    expandedDetail: [
      "A curricular internship at Tek4You, a software company then based in Viseu. I built the company's public website end to end, solo — product catalogue backed by MySQL, a contact form, and the site's content structure.",
      "The piece I owned most was a WhatsApp API integration that automated first-contact messaging to leads who came in through the site. The site is no longer online.",
    ],
  },
  {
    name: "theMonkeyBusinessNews",
    blurb:
      "A multi-section satirical news portal hand-built for a web-development course — dozens of article pages, no framework.",
    stack: ["HTML", "CSS", "JavaScript"],
    signatureStack: ["HTML", "CSS"],
    status: "shipped",
    expandedDetail: [
      "A coursework project for Aplicações para a Internet 1, built with a team of three; I was the lead contributor. A satirical news portal with sections for sports, science, lifestyle, politics and a horoscope, plus dozens of individual article pages.",
      "Entirely static — hand-written HTML, CSS and vanilla JavaScript, no framework and no build step.",
    ],
  },
];
