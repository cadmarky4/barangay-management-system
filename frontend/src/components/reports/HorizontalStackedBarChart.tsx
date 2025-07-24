export default function HorizontalStackedBarChart({
  data,
  showPercentage = true,
}: {
  data: { name: string; percentage: number }[];
  showPercentage: boolean;
}) {
  const colors = [
    {
      bg: "--color-smblue-100",
      text: "black",
    },
    {
      bg: "--color-smblue-200",
      text: "white",
    },
    {
      bg: "--color-smblue-300",
      text: "white",
    },
    {
      bg: "--color-smblue-400",
      text: "white",
    },
    {
      bg: "--color-smblue-50",
      text: "black",
    },
  ];
  return (
    <div className="w-full flex flex-col gap-4">
      <section className="w-full flex gap-1 rounded-lg overflow-hidden">
        {data.map((item, index) => (
          <div
            key={index}
            className={"flex justify-center items-center h-14"}
            style={{
              width: `${item.percentage}%`,
              //   grabe ang talino ko talaga
              background: `var(${colors[index % colors.length].bg})`,
              color: `${colors[index % colors.length].text}`,
            }}
          >
            {showPercentage && (
              <span className="text-sm @xl/main:text-base font-bold">
                {item.percentage}%
              </span>
            )}
          </div>
        ))}
      </section>

      <section className="w-full flex flex-col gap-1">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className="rounded-4xl h-4 w-4"
                style={{
                  background: `var(${colors[index % colors.length].bg})`,
                }}
              ></div>
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-bold">{item.percentage}%</span>
          </div>
        ))}
      </section>
    </div>
  );
}

