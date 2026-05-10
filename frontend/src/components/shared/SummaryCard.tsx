import React from "react";
import Card from "./Card";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "emerald" | "rose" | "indigo" | "gray";
  className?: string;
}

const SummaryCard = ({
  title,
  value,
  icon,
  variant = "indigo",
  className = "",
}: SummaryCardProps) => {
  const styles = {
    emerald: { border: "border-b-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600" },
    rose: { border: "border-b-rose-500", bg: "bg-rose-50", text: "text-rose-600" },
    indigo: { border: "border-b-indigo-500", bg: "bg-indigo-50", text: "text-indigo-600" },
    gray: { border: "border-b-gray-400", bg: "bg-gray-50", text: "text-gray-500" },
  };

  const currentStyle = styles[variant];

  return (
    <Card className={`p-5 flex items-center justify-between border-b-4 ${currentStyle.border} shadow-md ${className}`}>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
          {title}
        </p>
        <p className={`text-2xl font-black ${currentStyle.text}`}>
          {value}
        </p>
      </div>
      <div className={`h-10 w-10 rounded-xl ${currentStyle.bg} ${currentStyle.text} flex items-center justify-center`}>
        {icon}
      </div>
    </Card>
  );
};

export default SummaryCard;