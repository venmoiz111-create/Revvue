"use client";

export type DayCount = {
  date: string;
  label: string;
  count: number;
};

type Props = {
  days: DayCount[];
  avgStarRating: number | null;
};

export default function WeeklyChart({ days, avgStarRating }: Props) {
  const max = Math.max(...days.map((d) => d.count), 1);

  const W = 560;
  const H = 160;
  const BOTTOM = 36;
  const TOP_PAD = 16;
  const chartH = H - BOTTOM - TOP_PAD;
  const barW = Math.floor((W / days.length) * 0.55);
  const gap = W / days.length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white tracking-tight">
          Reviews last 7 days
        </h2>
        {avgStarRating !== null && (
          <div className="flex items-center gap-1.5">
            <span className="text-green-500 text-lg leading-none">★</span>
            <span className="font-black text-xl text-white">
              {avgStarRating.toFixed(1)}
            </span>
            <span className="text-xs text-zinc-500">avg rating</span>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        aria-label="Weekly review chart"
      >
        {days.map((day, i) => {
          const barH = max === 0 ? 0 : Math.round((day.count / max) * chartH);
          const x = gap * i + gap / 2;
          const y = TOP_PAD + chartH - barH;
          const isToday = i === days.length - 1;

          return (
            <g key={day.date}>
              <rect
                x={x - barW / 2}
                y={y}
                width={barW}
                height={barH || 2}
                rx={4}
                fill={isToday ? "#22c55e" : "#27272a"}
                opacity={barH === 0 ? 0.4 : 1}
              />
              {day.count > 0 && (
                <text
                  x={x}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={11}
                  fill={isToday ? "#22c55e" : "#71717a"}
                  fontWeight="600"
                >
                  {day.count}
                </text>
              )}
              <text
                x={x}
                y={H - 6}
                textAnchor="middle"
                fontSize={11}
                fill={isToday ? "#22c55e" : "#52525b"}
                fontWeight={isToday ? "600" : "400"}
              >
                {day.label}
              </text>
            </g>
          );
        })}
        <line
          x1={0}
          y1={TOP_PAD + chartH}
          x2={W}
          y2={TOP_PAD + chartH}
          stroke="#27272a"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}
