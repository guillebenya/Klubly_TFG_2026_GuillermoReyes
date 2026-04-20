import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card = ({ children, className = "", onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 
        ${onClick ? 'cursor-pointer hover:shadow-md transition-all active:scale-[0.98]' : ''} 
        ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;