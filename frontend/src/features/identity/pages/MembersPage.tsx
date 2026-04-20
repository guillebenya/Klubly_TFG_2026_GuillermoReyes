import React, { useEffect, useState } from "react";
import { Plus, Filter, Loader2 } from "lucide-react";
import PageHeader from "../../../components/shared/PageHeader";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import MemberCard from "../components/MemberCard";
import MemberDetails from "../components/MemberDetails";
import MemberForm from "../components/MemberForm"; // Importamos el formulario
import { userService } from "../services/user.service.ts";
import MemberTeamsManager from "../components/MemberTeamsManager.tsx";

const MembersPage = () => {
  // --- ESTADOS DE DATOS ---
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- ESTADOS PARA MODALES ---
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isTeamsOpen, setIsTeamsOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; type: 'save' | 'delete'; data?: any }>({
    isOpen: false,
    type: 'save'
  });
  const [successConfig, setSuccessConfig] = useState({ isOpen: false, title: '', desc: '' });

  // 1. Cargar miembros al montar el componente
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

  // --- HANDLERS DE ACCIONES ---

  // Abrir Modal de Detalles (Ojo)
  const handleView = (member: any) => {
    setSelectedMember(member);
    setIsViewOpen(true);
  };

  // Abrir Modal de Formulario para CREAR (Botón Añadir)
  const handleAddNew = () => {
    setSelectedMember(null); // Importante: limpiar para que el formulario sepa que es nuevo
    setIsFormOpen(true);
  };

  // Abrir Modal de Formulario para EDITAR (Lápiz)
  const handleEdit = (member: any) => {
    setSelectedMember(member); // Pasamos los datos del miembro
    setIsFormOpen(true);
  };

  // Acción de ELIMINAR (Papelera)
  const handleDelete = async (id: number) => {
    if (
      window.confirm("¿Estás seguro de que deseas dar de baja a este miembro?")
    ) {
      try {
        await userService.delete(id);
        fetchMembers(); // Recargamos la lista
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar al miembro.");
      }
    }
  };

  // Función para GUARDAR (Llamada desde el MemberForm)
  const handleSave = async (formData: any) => {
    try {
      setFormLoading(true);
      if (selectedMember) {
        // Si hay un miembro seleccionado, estamos EDITANDO (PUT)
        await userService.update(selectedMember.id, formData);
      } else {
        // Si no lo hay, estamos CREANDO (POST)
        await userService.create(formData);
      }

      setIsFormOpen(false); // Cerrar modal
      fetchMembers(); // Refrescar la lista principal
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
      alert("Error al guardar los datos del miembro.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleManageTeams = (member: any) => {
    setSelectedMember(member);
    setIsViewOpen(false);
    setIsTeamsOpen(true);
  };

  // --- FILTRADO ---
  const filteredMembers = members.filter((m) => {
    const searchString =
      `${m.firstName} ${m.lastName} ${m.email} ${m.username}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <PageHeader
        title="Gestión de Miembros"
        subtitle="Visualiza y gestiona todos los integrantes del club."
        onSearch={setSearchTerm}
        actions={
          <>
            <Button variant="secondary" icon={<Filter size={18} />}>
              Filtros
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={handleAddNew}
            >
              Añadir miembro
            </Button>
          </>
        }
      />

      {/* CONTENIDO PRINCIPAL */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-2" size={40} />
          <p className="font-medium italic">Sincronizando base de datos...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-500">
                No hay registros que coincidan con tu búsqueda.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL DE DETALLES (VER) --- */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Ficha Técnica del Miembro"
        size="lg"
      >
        {selectedMember && (
          <MemberDetails
            member={selectedMember}
            onManageTeams={handleManageTeams} //
          />
        )}
      </Modal>

      {/* MODAL 2: FORMULARIO ALTA/EDICIÓN */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedMember ? "Editar" : "Nuevo"}
      >
        <MemberForm
          initialData={selectedMember}
          onSubmit={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* MODAL 3: GESTIÓN DE EQUIPOS (Fichajes) */}
      <Modal
        isOpen={isTeamsOpen}
        onClose={() => setIsTeamsOpen(false)}
        title={`Equipos de ${selectedMember?.firstName}`}
      >
        {selectedMember && (
          <MemberTeamsManager
            member={selectedMember}
            onRefresh={() => {
              fetchMembers(); // Refresca la lista general
              setIsTeamsOpen(false); // Opcional: cerrar tras fichar o dejar abierta
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default MembersPage;
