function path(points: number[], w: number, h: number, max: number): string {
  const step = points.length > 1 ? w / (points.length - 1) : 0;
  return points.map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${h - (v / max) * h}`).join(" ");
}

export interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = "var(--cyan-500)", height = 36 }: SparklineProps) {
  const max = Math.max(1, ...data) * 1.1;
  return (
    <svg viewBox={`0 0 200 ${height}`} preserveAspectRatio="none" className="block w-full" style={{ height }}>
      <path d={path(data, 200, height, max)} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}
