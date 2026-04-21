import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card = ({ children, className = "", onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-50 shadow-xl p-6 
        ${onClick ? "cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]" : ""} 
        ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
