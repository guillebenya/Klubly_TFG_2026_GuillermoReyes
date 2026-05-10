import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card = ({ children, className = "", onClick, ...props }: CardProps) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`bg-white rounded-2xl border border-gray-50 shadow-xl p-6 
          cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]
          text-left w-full
          ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      {...props}
      className={`bg-white rounded-2xl border border-gray-50 shadow-xl p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
