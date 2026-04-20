import React from 'react';
import SearchBar from './SearchBar';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onSearch?: (value: string) => void;
  actions?: React.ReactNode; // "Slot" para botones
}

const PageHeader = ({ title, subtitle, onSearch, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-col mb-8 gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {onSearch && (
            <SearchBar onChange={onSearch} className="hidden sm:block w-64" />
          )}
          {/* Si pasas botones en 'actions', aparecerán aquí automáticamente */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
      
      {/* Buscador móvil (opcional) */}
      {onSearch && (
        <SearchBar onChange={onSearch} className="sm:hidden w-full" />
      )}
    </div>
  );
};

export default PageHeader;