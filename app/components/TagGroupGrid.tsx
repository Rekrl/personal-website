export interface TagGroup {
  label: string;
  items: string[];
}

export default function TagGroupGrid({ groups }: { groups: TagGroup[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="text-muted-4 text-xs tracking-widest uppercase mb-3">
            {g.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {g.items.map((item) => (
              <span
                key={item}
                className="text-xs border border-border px-2 py-1 text-muted-3"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
