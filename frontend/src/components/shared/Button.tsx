import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  icon,
  className = "",
  ...props
}: ButtonProps) => {
  // Estilos base
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  // Variantes de color
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md hover:shadow-indigo-200",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-200",
    danger:
      "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 focus:ring-red-500",
    success:
      "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 focus:ring-emerald-500",
    ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
  };

  // Tamaños
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
