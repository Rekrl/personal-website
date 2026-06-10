import ParticleNetwork from "./components/ParticleNetwork";

const projects = [
  {
    name: "Industrial IoT Platform",
    description:
      "End-to-end industrial monitoring: ESP32 edge firmware → MQTT broker → Node.js pipeline → InfluxDB → real-time dashboard + FastAPI anomaly detection. Containerised with Docker.",
    stack: ["ESP32", "MQTT", "Node.js", "InfluxDB", "FastAPI", "Docker"],
    cardHover: "hover:border-[#00ffff]",
    titleHover: "group-hover:text-[#00ffff]",
  },
  {
    name: "E-learning Platform",
    description:
      "Full learning management system with course creation, real-time chat, progress tracking and media uploads. Graded 19/20.",
    stack: ["React", "Node.js", "PostgreSQL", "Socket.io"],
    cardHover: "hover:border-[#ff00cc]",
    titleHover: "group-hover:text-[#ff00cc]",
  },
  {
    name: "Company Website",
    description:
      "Full company website built from scratch: product catalog, contact form, and WhatsApp API integration for automated client communication.",
    stack: ["HTML/CSS/JS", "PHP", "MySQL", "WhatsApp API"],
    cardHover: "hover:border-[#9b27af]",
    titleHover: "group-hover:text-[#9b27af]",
  },
];

const stack = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "FastAPI",
  "PHP",
  "Python",
  "C/C++",
  "PostgreSQL",
  "MongoDB",
  "InfluxDB",
  "MySQL",
  "Docker",
  "Git",
  "MQTT",
  "ESP32",
  "Linux",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white font-mono">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-16 py-4 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <span
          className="glitch text-[#00ffff] font-bold text-lg tracking-widest"
          data-text="ns."
        >
          ns.
        </span>
        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#about" className="hover:text-[#00ffff] transition-colors">
            about
          </a>
          <a
            href="#projects"
            className="hover:text-[#00ffff] transition-colors"
          >
            projects
          </a>
          <a href="#stack" className="hover:text-[#00ffff] transition-colors">
            stack
          </a>
          <a href="#contact" className="hover:text-[#00ffff] transition-colors">
            contact
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 pt-20">
        <ParticleNetwork />
        <div className="relative z-10 max-w-5xl">
          <p className="text-gray-600 text-xs tracking-[0.3em] mb-6 uppercase">
            portfolio — 2026
          </p>
          <h1
            className="glitch text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-none mb-6 uppercase"
            data-text="Nuno Santos"
          >
            Nuno Santos
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-2">
            Full-Stack Developer &amp; AI Enthusiast
          </p>
          <p className="text-gray-500 mb-12 flex items-center gap-3 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00ffff] blink" />
            Portugal 🇵🇹 · Graduating July 2026
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="#projects"
              className="px-6 py-3 border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-all text-xs tracking-widest uppercase"
            >
              View Projects
            </a>
            <a
              href="https://github.com/Rekrl"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-white/20 text-gray-400 hover:border-[#ff00cc] hover:text-[#ff00cc] transition-all text-xs tracking-widest uppercase"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/nunogonsantos"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-white/20 text-gray-400 hover:border-[#ff00cc] hover:text-[#ff00cc] transition-all text-xs tracking-widest uppercase"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* About */}

      <section id="about" className="px-6 md:px-16 py-24 max-w-4xl">
        <p className="text-gray-600 text-xs tracking-[0.3em] mb-6 uppercase">
          01 / about
        </p>
        <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
          Final-year CS student finishing July 2026 with a{" "}
          <span className="text-[#00ffff]">passion for building things</span>{" "}
          that mix software with the physical world — from IoT edge systems to
          full-stack web platforms.
        </p>
        <p className="mt-6 text-gray-400 leading-relaxed">
          I love AI-assisted development, prompt engineering, and anything that
          solves real problems. Background in competitive basketball — deadlines
          and pressure are nothing new.
        </p>
      </section>

      {/* Projects */}
      <section id="projects" className="px-6 md:px-16 py-24">
        <p className="text-gray-600 text-xs tracking-[0.3em] mb-8 uppercase">
          02 / projects
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {projects.map((p) => (
            <div
              key={p.name}
              className={`bg-black p-6 border border-white/10 ${p.cardHover} transition-colors group cursor-default`}
            >
              <h3
                className={`font-bold text-base mb-3 ${p.titleHover} transition-colors`}
              >
                {p.name}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                {p.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <span
                    key={s}
                    className="text-xs border border-white/10 px-2 py-1 text-gray-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="px-6 md:px-16 py-24">
        <p className="text-gray-600 text-xs tracking-[0.3em] mb-8 uppercase">
          03 / stack
        </p>
        <div className="flex flex-wrap gap-3">
          {stack.map((s) => (
            <span
              key={s}
              className="border border-white/10 px-3 py-2 text-sm text-gray-400 hover:border-[#ff00cc] hover:text-[#ff00cc] transition-colors cursor-default"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="px-6 md:px-16 py-24 border-t border-white/10"
      >
        <p className="text-gray-600 text-xs tracking-[0.3em] mb-6 uppercase">
          04 / contact
        </p>
        <p className="text-2xl md:text-3xl text-gray-200 mb-10 font-bold">
          Let&apos;s build something.
        </p>
        <div className="flex flex-col gap-4 text-sm text-gray-400">
          <a
            href="mailto:nunogoncalobsantos@gmail.com"
            className="hover:text-[#00ffff] transition-colors"
          >
            nunogoncalobsantos@gmail.com
          </a>
          <a
            href="https://github.com/Rekrl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00ffff] transition-colors"
          >
            github.com/Rekrl
          </a>
          <a
            href="https://www.linkedin.com/in/nunogonsantos"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00ffff] transition-colors"
          >
            linkedin.com/in/nunogonsantos
          </a>
        </div>
      </section>

      <footer className="px-6 md:px-16 py-6 border-t border-white/10 text-gray-700 text-xs flex justify-between">
        <span>Nuno Santos · 2026</span>
        <span>Built with Next.js + TypeScript</span>
      </footer>
    </main>
  );
}
