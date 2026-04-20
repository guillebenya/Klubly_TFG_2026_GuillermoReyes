import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield } from 'lucide-react';
import Button from '../../../components/shared/Button';
import { teamService } from '../services/team.service';
import { affiliationService } from '../services/affiliation.service';

interface MemberTeamsManagerProps {
  member: any;
  onRefresh: () => void; // Para refrescar la ficha tras cambios
}

const MemberTeamsManager = ({ member, onRefresh }: MemberTeamsManagerProps) => {
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para el mini-formulario de alta
  const [newAffiliation, setNewAffiliation] = useState({
    teamId: '',
    teamPosition: ''
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const resp = await teamService.getAll();
    setAllTeams(resp.data);
  };

  const handleAdd = async () => {
  // 1. Log de depuración para ver qué enviamos exactamente
  console.log("Enviando afiliación para el usuario ID:", member.id);
  console.log("Datos del miembro completo:", member);

  if (!newAffiliation.teamId || !newAffiliation.teamPosition) {
    alert("Por favor, selecciona un equipo y una posición.");
    return;
  }
  
  setLoading(true);
  try {
    await affiliationService.create({
      userId: Number(member.id), // Forzamos que sea número
      teamId: Number(newAffiliation.teamId),
      teamPosition: newAffiliation.teamPosition
    });
    setNewAffiliation({ teamId: '', teamPosition: '' });
    onRefresh();
  } catch (err: any) {
    console.error("Error al crear afiliación:", err.response?.data);
    alert("Error del servidor: " + (err.response?.data?.message || "Usuario no encontrado"));
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar esta afiliación?")) {
      await affiliationService.delete(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. LISTA ACTUAL */}
      <div className="space-y-3">
        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Equipos actuales</h5>
        {member.affiliations?.length > 0 ? (
          member.affiliations.map((aff: any) => (
            <div key={aff.id} className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{aff.teamName}</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase">{aff.teamPosition}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(aff.id)} className="text-red-500 hover:bg-red-50">
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Sin equipos asignados
          </p>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* 2. FORMULARIO PARA AÑADIR */}
      <div className="space-y-3">
        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Añadir a un equipo</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select 
            value={newAffiliation.teamId}
            onChange={(e) => setNewAffiliation({...newAffiliation, teamId: e.target.value})}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Seleccionar Equipo...</option>
            {allTeams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <input 
            placeholder="Ej: Delantero, Entrenador..."
            value={newAffiliation.teamPosition}
            onChange={(e) => setNewAffiliation({...newAffiliation, teamPosition: e.target.value})}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button 
          variant="primary" 
          className="w-full" 
          icon={<Plus size={18} />}
          onClick={handleAdd}
          isLoading={loading}
          disabled={!newAffiliation.teamId || !newAffiliation.teamPosition}
        >
          Confirmar Fichaje
        </Button>
      </div>
    </div>
  );
};

export default MemberTeamsManager;