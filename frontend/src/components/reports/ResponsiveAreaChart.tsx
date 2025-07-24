import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";

export default function ResponsiveAreaChart({
  data,
}: {
  data: { timeLabel: string; value: number }[];
}) {
  return (
    <ResponsiveContainer maxHeight={348}>
      <AreaChart data={data} margin={{ top: 10, bottom: 10 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#367096" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#367096" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="timeLabel"
          fontSize={12}
          angle={-45}
          tick={{ dy: 10 }}
        />
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
        <Area
          type="natural"
          dataKey="value"
          stroke="#367096"
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

