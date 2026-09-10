import ParticleNetwork from "./components/ParticleNetwork";
import ThemeToggle from "./components/ThemeToggle";
import ProjectCards from "./projects/_components/ProjectCards";
import OtherWorkGrid from "./projects/_components/OtherWorkGrid";

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
    <main className="min-h-screen bg-background text-foreground font-mono">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-16 py-4 flex items-center justify-between border-b border-border bg-nav backdrop-blur-sm">
        <span
          className="glitch text-cyan font-bold text-lg tracking-widest"
          data-text="ns."
        >
          ns.
        </span>
        <div className="flex items-center gap-6 text-sm text-muted-3">
          <a href="#about" className="hover:text-cyan transition-colors">
            about
          </a>
          <a
            href="#projects"
            className="hover:text-cyan transition-colors"
          >
            projects
          </a>
          <a href="#stack" className="hover:text-cyan transition-colors">
            stack
          </a>
          <a href="#contact" className="hover:text-cyan transition-colors">
            contact
          </a>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 pt-20">
        <ParticleNetwork />
        <div className="relative z-10 max-w-5xl">
          <p className="text-muted-5 text-xs tracking-[0.3em] mb-6 uppercase">
            portfolio — 2026
          </p>
          <h1
            className="glitch text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-none mb-6 uppercase"
            data-text="Nuno Santos"
          >
            Nuno Santos
          </h1>
          <p className="text-lg md:text-xl text-muted-2 mb-2">
            Full-Stack Developer &amp; AI Enthusiast
          </p>
          <p className="text-muted-4 mb-12 flex items-center gap-3 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan blink" />
            Portugal 🇵🇹 · Graduating July 2026
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="#projects"
              className="px-6 py-3 border border-cyan text-cyan hover:bg-cyan hover:text-on-accent transition-all text-xs tracking-widest uppercase"
            >
              View Projects
            </a>
            <a
              href="https://github.com/Rekrl"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-border-strong text-muted-3 hover:border-magenta hover:text-magenta transition-all text-xs tracking-widest uppercase"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/nunogonsantos"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-border-strong text-muted-3 hover:border-magenta hover:text-magenta transition-all text-xs tracking-widest uppercase"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* About */}

      <section id="about" className="px-6 md:px-16 py-24 max-w-4xl">
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-6 uppercase">
          01 / about
        </p>
        <p className="text-xl md:text-2xl text-muted-1 leading-relaxed">
          Final-year CS student finishing July 2026 with a{" "}
          <span className="text-cyan">passion for building things</span>{" "}
          that mix software with the physical world — from IoT edge systems to
          full-stack web platforms.
        </p>
        <p className="mt-6 text-muted-3 leading-relaxed">
          I love AI-assisted development, prompt engineering, and anything that
          solves real problems. Background in competitive basketball — deadlines
          and pressure are nothing new.
        </p>
      </section>

      {/* Projects */}
      <section id="projects" className="px-6 md:px-16 py-24">
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-8 uppercase">
          02 / projects
        </p>
        <ProjectCards />
        <div className="mt-16">
          <p className="text-muted-4 text-sm mb-6 max-w-2xl leading-relaxed">
            Also built, in less depth — coursework, team projects, and earlier
            client work. Click to expand.
          </p>
          <OtherWorkGrid />
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="px-6 md:px-16 py-24">
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-8 uppercase">
          03 / stack
        </p>
        <div className="flex flex-wrap gap-3">
          {stack.map((s) => (
            <span
              key={s}
              className="border border-border px-3 py-2 text-sm text-muted-3 hover:border-magenta hover:text-magenta transition-colors cursor-default"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="px-6 md:px-16 py-24 border-t border-border"
      >
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-6 uppercase">
          04 / contact
        </p>
        <p className="text-2xl md:text-3xl text-muted-1 mb-10 font-bold">
          Let&apos;s build something.
        </p>
        <div className="flex flex-col gap-4 text-sm text-muted-3">
          <a
            href="mailto:nunogoncalobsantos@gmail.com"
            className="hover:text-cyan transition-colors"
          >
            nunogoncalobsantos@gmail.com
          </a>
          <a
            href="https://github.com/Rekrl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan transition-colors"
          >
            github.com/Rekrl
          </a>
          <a
            href="https://www.linkedin.com/in/nunogonsantos"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan transition-colors"
          >
            linkedin.com/in/nunogonsantos
          </a>
        </div>
      </section>

      <footer className="px-6 md:px-16 py-6 border-t border-border text-muted-6 text-xs flex justify-between">
        <span>Nuno Santos · 2026</span>
        <span>Built with Next.js + TypeScript</span>
      </footer>
    </main>
  );
}
