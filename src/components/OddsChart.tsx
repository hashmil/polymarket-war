import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DataPoint {
  date: string;
  [market: string]: string | number;
}

export function OddsChart({
  data,
  lines,
}: {
  data: DataPoint[];
  lines: { key: string; color: string; label: string }[];
}) {
  if (data.length < 2) {
    return (
      <div className="text-center text-text-muted text-sm py-8">
        Need at least 2 snapshots to show trends. Run{" "}
        <code className="font-mono bg-border/30 px-1.5 py-0.5 rounded">
          bun run fetch
        </code>{" "}
        again later.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
        <XAxis
          dataKey="date"
          stroke="#7d8590"
          fontSize={10}
          fontFamily="DM Mono"
        />
        <YAxis
          domain={[0, 100]}
          stroke="#7d8590"
          fontSize={10}
          fontFamily="DM Mono"
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 8,
            fontFamily: "DM Mono",
            fontSize: 12,
          }}
          formatter={(value: number) => [`${value}%`]}
        />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            name={line.label}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
