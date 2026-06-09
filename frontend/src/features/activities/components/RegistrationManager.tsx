import React, { useEffect, useState } from "react";
import { Users, UserPlus, Trash2, Phone, Mail } from "lucide-react";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import Badge from "../../../components/shared/Badge";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SuccessDialog from "../../../components/shared/SuccessDialog";
import AddRegistrationForm from "./AddRegistrationForm";
import {
  registrationService,
  type Registration,
} from "../services/registration.service";
import { type Activity } from "../services/activity.service";

interface RegistrationManagerProps {
  activity: Activity;
  onClose: () => void;
  onRefresh?: () => void;
}

const RegistrationManager: React.FC<RegistrationManagerProps> = ({
  activity,
  onClose,
  onRefresh,
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isFull = registrations.length >= activity.capacity;
  const isPast = new Date(activity.endDate) < new Date();
  const isBtnDisabled = isFull || isPast;

  useEffect(() => {
    fetchRegistrations();
  }, [activity.id]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const resp = await registrationService.getByActivity(activity.id);
      setRegistrations(resp.data);
    } catch (error) {
      console.error("Error al cargar inscritos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (regId: number) => {
    setSelectedRegId(regId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRegId) return;
    try {
      setDeleteLoading(true);
      await registrationService.remove(selectedRegId);
      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
      fetchRegistrations();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error al eliminar", error);
    } finally {
      setDeleteLoading(false);
      setSelectedRegId(null);
    }
  };

  const renderRegistrationList = () => {
    if (loading) {
      return (
        <p className="text-center py-10 text-gray-400 italic">
          Cargando lista...
        </p>
      );
    }

    if (registrations.length === 0) {
      return (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
          <p className="text-gray-400">
            {isPast ? "No hubo ningún inscrito." : "No hay nadie inscrito todavía."}
          </p>
        </div>
      );
    }

    return registrations.map((reg) => (
      <div
        key={reg.id}
        className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 transition-colors shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">{reg.userFullName}</span>
            {reg.teamName && <Badge variant="indigo">{reg.teamName}</Badge>}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Mail size={12} /> {reg.userEmail}
            </span>
            <span className="flex items-center gap-1">
              <Phone size={12} /> {reg.userPhone}
            </span>
          </div>
          {reg.teamPosition && (
            <span className="text-[10px] uppercase font-bold text-indigo-500 mt-1">
              Posición: {reg.teamPosition}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="!text-red-500 hover:!bg-red-50"
            icon={<Trash2 size={18} />}
            onClick={() => handleDeleteClick(reg.id)}
          />
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">
              Inscritos en la actividad
            </h3>
            <p className="text-sm text-gray-500">
              {registrations.length} de {activity.capacity} plazas cubiertas
            </p>
          </div>
        </div>

        <div
          title={
            isPast
              ? "No se pueden añadir más inscritos: la actividad ya ha finalizado"
              : isFull
                ? "No se pueden añadir más inscritos: el cupo de la actividad está lleno"
                : ""
          }
        >
          <Button
            variant="add"
            icon={<UserPlus size={18} />}
            onClick={() => setIsAddModalOpen(true)}
            disabled={isBtnDisabled}
          >
            Añadir Inscripción
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {renderRegistrationList()}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Añadir Miembro a Actividad"
        size="sm"
      >
        <AddRegistrationForm
          activity={activity}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchRegistrations();
            if (onRefresh) onRefresh();
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          onClose();
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Inscripción"
        description="¿Estás seguro de que deseas eliminar a este miembro de la actividad? Esta acción no se puede deshacer."
        isLoading={deleteLoading}
      />

      <SuccessDialog
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Inscripción Eliminada"
        description="El miembro ha sido retirado de la actividad correctamente."
      />
    </div>
  );
};

export default RegistrationManager;
