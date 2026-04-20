import React, { useEffect, useState } from "react";
import { Plus, Filter, Loader2 } from "lucide-react";
import PageHeader from "../../../components/shared/PageHeader";
import Button from "../../../components/shared/Button";
import MemberCard from "../components/MemberCard";
import { userService } from "../services/user.service.ts";

const MembersPage = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Cargar miembros al entrar
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

  // 2. Lógica de filtrado (Buscador)
  const filteredMembers = members.filter((m) => {
    const searchString =
      `${m.firstName} ${m.lastName} ${m.email} ${m.username}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Acciones de la cabecera
  const headerActions = (
    <>
      <Button variant="secondary" icon={<Filter size={18} />}>
        Filtros
      </Button>
      <Button variant="primary" icon={<Plus size={18} />}>
        Añadir miembro
      </Button>
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
          <p>Cargando miembros...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onView={(m) => console.log("Ver", m)}
                onEdit={(m) => console.log("Editar", m)}
                onDelete={(id) => console.log("Eliminar", id)}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-500">
                No se encontraron miembros que coincidan con la búsqueda.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MembersPage;
