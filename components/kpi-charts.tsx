type ChartDatum = {
  label: string;
  value: number;
  color?: string;
};

type DonutChartProps = {
  data: ChartDatum[];
  totalLabel: string;
};

type HorizontalBarChartProps = {
  data: ChartDatum[];
};

const fallbackPalette = ["#214cff", "#17c2ff", "#19c37d", "#ffab3d", "#ff5bc7", "#5663ff"];

function buildConicGradient(data: ChartDatum[]) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return "conic-gradient(#dbe7ff 0deg 360deg)";
  }

  let cursor = 0;
  const stops = data.map((item, index) => {
    const slice = (item.value / total) * 360;
    const start = cursor;
    const end = cursor + slice;
    cursor = end;
    return `${item.color ?? fallbackPalette[index % fallbackPalette.length]} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

export function DonutChart({ data, totalLabel }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="kpi-chart-card">
      <div className="donut-chart-wrap">
        <div
          className="donut-chart"
          style={{ backgroundImage: buildConicGradient(data) }}
        >
          <div className="donut-chart-center">
            <strong>{total}</strong>
            <span>{totalLabel}</span>
          </div>
        </div>
      </div>

      <div className="chart-legend-list">
        {data.map((item, index) => (
          <div className="chart-legend-item" key={item.label}>
            <span
              className="chart-legend-dot"
              style={{ background: item.color ?? fallbackPalette[index % fallbackPalette.length] }}
            />
            <span className="chart-legend-label">{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HorizontalBarChart({ data }: HorizontalBarChartProps) {
  const max = Math.max(...data.map((item) => item.value), 0);

  return (
    <div className="bar-chart-list">
      {data.map((item, index) => {
        const width = max > 0 ? `${(item.value / max) * 100}%` : "0%";

        return (
          <div className="bar-chart-row" key={item.label}>
            <div className="bar-chart-head">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="bar-chart-track">
              <div
                className="bar-chart-fill"
                style={{
                  width,
                  background:
                    item.color ??
                    `linear-gradient(90deg, ${
                      fallbackPalette[index % fallbackPalette.length]
                    }, rgba(23, 194, 255, 0.88))`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
