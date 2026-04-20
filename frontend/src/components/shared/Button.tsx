import React from 'react';
import { Loader2 } from 'lucide-react'; // Importamos el spinner

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'add';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  icon, 
  isLoading, 
  children, 
  className = "", 
  disabled,
  ...props 
}: ButtonProps) => {
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    add: "bg-green-600 text-white hover:bg-green-700 border border-green-600"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      disabled={disabled || isLoading} // Deshabilitar si está cargando
      className={`
        inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {/* Si está cargando, mostramos spinner. Si no, mostramos el icono */}
      {isLoading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;