import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "indigo" | "gray" | "green" | "red" | "amber";
  icon?: React.ReactNode;
  className?: string;
}

const Badge = ({
  children,
  variant = "gray",
  icon,
  className = "",
}: BadgeProps) => {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };

  return (
    <span
      className={`
        inline-flex items-center px-1.5 py-0 shadow-sm rounded-md 
        text-[10px] font-bold border leading-4 
        ${styles[variant]} 
        ${className}
      `}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
