import React from 'react';
import SearchBar from './SearchBar';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onSearch?: (value: string) => void;
  actions?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, onSearch, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-6 mb-6">
      {/* Usamos justify-start y un gap-8 para que todo vaya seguido */}
      <div className="flex flex-col md:flex-row md:items-center justify-start gap-8">
        
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight whitespace-nowrap">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onSearch && (
            <SearchBar onChange={onSearch} className="w-64" />
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;