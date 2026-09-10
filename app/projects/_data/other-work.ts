import type { OtherWork } from "./types";

// Secondary work shown under the four case studies. Copy is final, from
// "Decide: 'other work' list contents & copy" (wayfinder map #1, issue #9).
// CodeViseuUnited and MeteoDashboard were deliberately omitted as too thin.

export const otherWork: OtherWork[] = [
  {
    name: "Cartógrafo",
    blurb:
      "University AI project — route-finding across 18 Portuguese cities with four graph-search algorithms, licence-plate login via OCR, and a local LLM narrating each city's sights along the route.",
    stack: ["Python", "Streamlit", "EasyOCR", "Ollama / Mistral 7B", "OSRM"],
    status: "shipped",
    expandedDetail: [
      "A university AI assignment built into a working route planner: pick two of 18 Portuguese cities and it searches the road graph with A*, uniform-cost, greedy and depth-limited search, comparing them on path cost and nodes expanded.",
      "Login is by licence plate, read with EasyOCR; a local Mistral 7B via Ollama narrates what's worth seeing in each city along the way, and OSRM supplies the real road distances.",
      "Co-built with a partner — I was the lead contributor.",
    ],
  },
  {
    name: "Company website — Tek4You",
    blurb:
      "Company website built from scratch during a curricular internship at Tek4You (Viseu) — product catalogue, contact form, and a WhatsApp API integration for automated client messaging.",
    stack: ["PHP", "MySQL", "JavaScript", "WhatsApp API"],
    status: "shipped",
    expandedDetail: [
      "Built solo during a curricular internship at Tek4You in Viseu: a full company site — product catalogue, contact form, and a WhatsApp Business API integration that automated the first reply to client enquiries.",
      "Plain PHP and MySQL. It shipped and ran for the company; it is no longer online.",
    ],
  },
  {
    name: "theMonkeyBusinessNews",
    blurb:
      "A multi-section satirical news portal (sports, science, lifestyle, politics, horoscope) hand-built for a web-development course — dozens of article pages, no framework.",
    stack: ["HTML", "CSS", "JavaScript"],
    status: "shipped",
    expandedDetail: [
      "A satirical news portal for a web-development course — sports, science, lifestyle, politics and a horoscope section, dozens of hand-written article pages with no framework.",
      "A team of three; I was the lead contributor. Plain HTML, CSS and JavaScript, 2024–25.",
    ],
  },
];
