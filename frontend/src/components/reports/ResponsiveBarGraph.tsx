import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
} from "recharts";

export default function ResponsiveBarGraph({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <ResponsiveContainer maxHeight={320}>
      <BarChart data={data} margin={{ top: 10, bottom: 20 }}>
        <XAxis dataKey="label" fontSize={12} angle={-45} tick={{ dy: 15 }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value / 1000}k`}
          fontSize={12}
          // Neat little trick that removes wasted space to the left of Y-Axis
          width={40}
        />
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <Tooltip contentStyle={{ borderRadius: "16px" }} />
        <Bar dataKey="value" fill="#367096" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

