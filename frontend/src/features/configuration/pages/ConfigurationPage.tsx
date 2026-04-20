import React, { useState } from 'react';
import { ShieldCheck, Users2, Package, Settings } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
import RolesSection from '../components/RolesSection';
import TeamsSection from '../components/TeamsSection';
//import TeamsSection from '../components/TeamsSection';

const ConfigurationPage = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'teams' | 'inventory'>('roles');

  const tabs = [
    { id: 'roles', label: 'Gestión de Roles', icon: <ShieldCheck size={18} /> },
    { id: 'teams', label: 'Gestión de Equipos', icon: <Users2 size={18} /> },
    { id: 'inventory', label: 'Gestión de Inventario', icon: <Package size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header principal de la sección */}
      <PageHeader 
        title="Configuración del Club" 
        subtitle="Administra los roles, equipos e inventario."
      />

      {/* 2. Barra de Navegación de Pestañas */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Renderizado Condicional del Contenido */}
      <div className="pt-2">
        {activeTab === 'roles' && <RolesSection />}
        {activeTab === 'teams' && <TeamsSection />}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-tight">Próximamente</h3>
            <p className="text-sm text-gray-400 italic">El módulo de inventario se implementará en futuras versiones.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurationPage;