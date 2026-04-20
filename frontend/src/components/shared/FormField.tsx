import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  children?: React.ReactNode; // Para las opciones si es un <select>
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const FormField = ({
  label,
  name,
  type = "text",
  error,
  placeholder,
  required,
  children,
  value,
  onChange
}: FormFieldProps) => {
  
  const baseInputStyles = `w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all text-sm
    ${error 
      ? 'border-red-500 focus:ring-4 focus:ring-red-100' 
      : 'border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500'}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-sm font-bold text-gray-700 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={baseInputStyles}
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseInputStyles}
        />
      )}

      {error && (
        <span className="text-xs text-red-500 font-medium ml-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;