"use client";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color: "blue" | "yellow" | "green" | "purple";
  icon: React.ReactNode;
}

const colorMap = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  green: "bg-green-50 border-green-200 text-green-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
};

const iconBgMap = {
  blue: "bg-blue-100",
  yellow: "bg-yellow-100",
  green: "bg-green-100",
  purple: "bg-purple-100",
};

export function StatsCard({ title, value, subtitle, color, icon }: StatsCardProps) {
  return (
    <div className={`rounded-xl border-2 p-6 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconBgMap[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
