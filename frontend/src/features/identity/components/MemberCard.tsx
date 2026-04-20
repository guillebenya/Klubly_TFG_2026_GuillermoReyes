import React from 'react';
import { User as UserIcon, Mail, Shield, Briefcase, Users, Eye, Edit2, Trash2 } from 'lucide-react';
import Card from '../../../components/shared/Card';
import Badge from '../../../components/shared/Badge';
import Button from '../../../components/shared/Button';

interface MemberCardProps {
  member: any; // Luego definiremos una Interface propia para UserDTO
  onView: (member: any) => void;
  onEdit: (member: any) => void;
  onDelete: (id: number) => void;
}

const MemberCard = ({ member, onView, onEdit, onDelete }: MemberCardProps) => {
  return (
    <Card className="flex flex-col md:flex-row items-center gap-6 py-4 px-6 hover:border-indigo-200 transition-colors">
      
      {/* 1. Avatar / Imagen */}
      <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-50 shrink-0">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt={member.username} className="h-full w-full object-cover" />
        ) : (
          <UserIcon className="text-indigo-400" size={32} />
        )}
      </div>

      {/* 2. Información Principal (Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
        
        {/* Nombre y Email */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Miembro</span>
          <p className="text-sm font-bold text-gray-900">{member.firstName} {member.lastName}</p>
          <div className="flex items-center gap-1.5 text-gray-500 mt-1">
            <Mail size={14} />
            <span className="text-xs">{member.email}</span>
          </div>
        </div>

        {/* Estado y Rol */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Identidad</span>
          <div className="flex gap-2 mt-1">
            <Badge variant={member.active ? 'green' : 'red'}>
              {member.active ? 'ACTIVO' : 'INACTIVO'}
            </Badge>
            <Badge variant="indigo">{member.roleName || 'MEMBER'}</Badge>
          </div>
        </div>

        {/* Puesto en Club y Equipo */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cargo Club</span>
          <p className="text-sm font-medium text-gray-600 mt-0.5">
            {member.clubPosition || 'Sin cargo'}
          </p>
        </div>

        {/* Resumen de Afiliación (Lo que hablamos) */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Equipos</span>
          <div className="flex items-center gap-1.5 text-gray-600 mt-0.5">
            <Users size={14} />
            <span className="text-xs font-medium">Ver afiliaciones...</span>
          </div>
        </div>
      </div>

      {/* 3. Acciones (Botones) */}
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" icon={<Eye size={16} />} onClick={() => onView(member)} className="text-blue-600 hover:bg-blue-50" />
        <Button variant="ghost" size="sm" icon={<Edit2 size={16} />} onClick={() => onEdit(member)} className="text-amber-600 hover:bg-amber-50" />
        <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} onClick={() => onDelete(member.id)} className="text-red-600 hover:bg-red-50" />
      </div>
    </Card>
  );
};

export default MemberCard;