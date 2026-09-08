import type { MediaItem } from "../_data/types";
import SectionLabel from "./SectionLabel";

function Item({ item }: { item: MediaItem }) {
  if (item.kind === "image") {
    // Static portfolio assets from /public — next/image adds no value here.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.src} alt={item.caption} className="w-full block" />;
  }
  if (item.kind === "video") {
    return (
      <video
        src={item.src}
        poster={item.poster}
        muted
        loop
        autoPlay
        playsInline
        className="w-full block"
      />
    );
  }
  return (
    <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${item.src}`}
        title={item.caption}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}

export default function CaseMedia({
  n,
  media,
}: {
  n?: string;
  media: MediaItem[];
}) {
  return (
    <section className="px-6 md:px-16 py-20 border-b border-border">
      <SectionLabel n={n} title="in motion" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {media.map((m, i) => (
          <figure key={i} className="m-0">
            <div className="bg-surface border border-border overflow-hidden">
              <Item item={m} />
            </div>
            <figcaption className="text-muted-4 text-sm mt-3 leading-relaxed">
              {m.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
