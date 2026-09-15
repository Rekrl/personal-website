export interface SkillGroup {
  category: string;
  items: string[];
}

// Single source of truth for "what Nuno knows" — cross-checked against
// every shipped project's real stack (app/projects/_data/*.ts), not
// just the CV. The homepage's flat tag list and the About page's
// categorized groups both derive from this.
export const skillGroups: SkillGroup[] = [
  { category: "Languages", items: ["JavaScript", "TypeScript", "Python", "C/C++", "PHP", "Dart"] },
  { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "Bootstrap", "Flutter"] },
  { category: "Backend", items: ["Node.js", "Express", "NestJS", "FastAPI", "Socket.io"] },
  { category: "Data & ORM", items: ["PostgreSQL", "MySQL", "MongoDB", "InfluxDB", "Prisma", "Sequelize"] },
  { category: "IoT / Embedded", items: ["ESP32-S3", "PlatformIO", "MQTT", "Modbus RTU/RS-485", "I2C"] },
  { category: "Cloud / DevOps", items: ["Docker", "AWS S3", "Firebase", "Linux", "Git"] },
];

export const flatSkills: string[] = skillGroups.flatMap((g) => g.items);
