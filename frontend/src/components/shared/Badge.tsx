import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "indigo" | "gray" | "green" | "red" | "amber" | "blue" | "orange";
  textSize?: "xl" | "lg" | "base" | "mediano" | "sm";
  icon?: React.ReactNode;
  className?: string;
}

const Badge = ({
  children,
  variant = "gray",
  textSize = "sm",
  icon,
  className = "",
}: BadgeProps) => {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  };

  const sizeConfig = {
    xl: "text-xl px-3 py-1",
    lg: "text-lg px-2.5 py-0.5",
    base: "text-base px-2 py-0.5",
    mediano: "text-[12px] px-1.5 py-0",
    sm: "text-[10px] px-1.5 py-0",
  };

  return (
    <span
      className={`
        inline-flex items-center shadow-sm rounded-md 
        font-bold border leading-4
        ${styles[variant]}
        ${sizeConfig[textSize]} 
        ${className}
      `}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
