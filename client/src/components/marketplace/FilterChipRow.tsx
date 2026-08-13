export function FilterChipRow({
  label,
  testGroup,
  options,
  value,
  onChange,
}: {
  label: string;
  testGroup: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex items-center flex-wrap gap-2"
      data-testid={`filter-row-${testGroup}`}
    >
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 w-20">
        {label}
      </span>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            data-testid={`filter-${testGroup}-${opt.toLowerCase()}`}
            className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-all border ${
              active
                ? "bg-primary/15 text-primary border-primary/40"
                : "bg-white/5 text-muted-foreground border-white/10 hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
