type MetricCardProps = {
  label: string;
  value: number | string;
  tone: "blue" | "navy" | "pink" | "lime" | "orange" | "red" | "aqua" | "indigo";
  note?: string;
  variant?: "default" | "hero" | "compact";
};

export function MetricCard({
  label,
  value,
  tone,
  note,
  variant = "default"
}: MetricCardProps) {
  return (
    <article className="metric-card" data-tone={tone} data-variant={variant}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      {note ? <span className="metric-note">{note}</span> : null}
    </article>
  );
}
