import React, { useEffect, useState } from 'react';
import { Plus, Filter, Loader2 } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
import Button from '../../../components/shared/Button';
import Modal from '../../../components/shared/Modal'; // Importamos el Modal compartido
import MemberCard from '../components/MemberCard';
import MemberDetails from '../components/MemberDetails'; // Importamos el contenido de Ver
import { userService } from '../services/user.service.ts';

const MembersPage = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- ESTADOS PARA MODALES ---
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  // ----------------------------

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setMembers(response.data);
    } catch (error) {
      console.error("Error cargando miembros:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para las acciones de la Card
  const handleView = (member: any) => {
    setSelectedMember(member);
    setIsViewOpen(true);
  };

  const handleEdit = (member: any) => {
    console.log("Abriendo edición para:", member.username);
    // Próximo paso: setIsEditOpen(true)
  };

  const handleDelete = (id: number) => {
    console.log("Desea eliminar ID:", id);
    // Próximo paso: ConfirmDialog
  };

  const filteredMembers = members.filter(m => {
    const searchString = `${m.firstName} ${m.lastName} ${m.email} ${m.username}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const headerActions = (
    <>
      <Button variant="secondary" icon={<Filter size={18} />}>Filtros</Button>
      <Button variant="primary" icon={<Plus size={18} />}>Añadir miembro</Button>
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestión de Miembros" 
        subtitle="Visualiza y gestiona todos los integrantes del club."
        onSearch={setSearchTerm}
        actions={headerActions}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-2" size={40} />
          <p className="font-medium">Sincronizando con el club...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => (
              <MemberCard 
                key={member.id} 
                member={member} 
                onView={handleView}   // Orquestado
                onEdit={handleEdit}   // Preparado
                onDelete={handleDelete} // Preparado
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
              <p className="text-gray-500">No hay miembros que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL DE DETALLES (VER) --- */}
      <Modal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        title="Ficha del Miembro"
        size="lg" 
      >
        {selectedMember && <MemberDetails member={selectedMember} />}
      </Modal>

    </div>
  );
};

export default MembersPage;