export interface Milestone {
  hash: string;
  date: string;
  title: string;
  body?: string;
}

export const milestones: Milestone[] = [
  {
    hash: "7e2a91f",
    date: "Feb 2026 – Jun 2026",
    title: "Software Engineering Intern — STAR Institute",
    body: "Built an end-to-end Industrial IoT platform: ESP32-S3 edge firmware, an MQTT-to-InfluxDB pipeline, a real-time dashboard, and a FastAPI anomaly-detection service.",
  },
  {
    hash: "5c10d4a",
    date: "2023 – 2026",
    title: "Computer Science and Engineering — Instituto Politécnico de Viseu",
    body: "Full-stack, systems and IoT coursework alongside internship and personal-project work.",
  },
  {
    hash: "3b88e02",
    date: "2023",
    title: "Professional Internship — Tek4You",
    body: "PC/laptop repair and in-store support; built and deployed the company's website with a product catalog and WhatsApp API integration.",
  },
  {
    hash: "9f4a17c",
    date: "2022 – 2023",
    title: "Technical Specialist, Mgmt. Informatics Applications (Level 5) — Cesae Digital",
  },
  {
    hash: "0a2f9e1",
    date: "2018 – 2022",
    title: "Retail & Warehouse Operator — Jerónimo Martins, Pingo Doce",
  },
];
