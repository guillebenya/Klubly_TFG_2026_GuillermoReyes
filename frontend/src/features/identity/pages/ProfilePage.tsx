import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { authService } from "../../auth/services/auth.service";
import { userService } from "../services/user.service";

// Componentes de perfil
import ProfileAvatarCard from "../components/ProfileAvatarCard";
import ProfilePersonalInfoCard from "../components/ProfilePersonalInfoCard";
import ProfileAccountInfoCard from "../components/ProfileAccountInfoCard";
import ChangePasswordCard from "../components/ChangePasswordCard";

// Componentes compartidos
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SuccessDialog from "../../../components/shared/SuccessDialog";
import MyTeamsTableCard from "../components/MyTeamsTableCard";
import Modal from "../../../components/shared/Modal";
import Button from "../../../components/shared/Button";

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA DIÁLOGOS Y CARGA ---
  const [formLoading, setFormLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: "save" | "delete";
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: "save",
    title: "",
    description: "",
  });

  const [successConfig, setSuccessConfig] = useState({
    isOpen: false,
    title: "",
    desc: "",
  });

  // --- ESTADOS PARA MODALES DE EDICIÓN ---
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState(false);
  const [passwordData, setPasswordData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [serverPasswordError, setServerPasswordError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      if (currentUser?.username) {
        const response = await userService.getByUsername(currentUser.username);
        setProfile(response.data);
      }
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  //LÓGICA DE CAMBIO DE CONTRASEÑA
  const handleChangePasswordTrigger = (data: any) => {
    setServerPasswordError("");
    setEditData(null);
    setPasswordData(data);
    setConfirmConfig({
      isOpen: true,
      type: "save",
      title: "¿Confirmar cambio de contraseña?",
      description:
        "Se actualizará tu clave de acceso. Deberás usar la nueva en tu próximo inicio de sesión.",
    });
  };

  // LÓGICA DE ACTUALIZACIÓN DE PERFIL
  const handleUpdateTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordData(null);
    setConfirmConfig({
      isOpen: true,
      type: "save",
      title: "¿Guardar cambios?",
      description: "Se actualizará la información de tu perfil en el sistema.",
    });
  };

  const executeAction = async () => {
    try {
      setFormLoading(true);
      setServerPasswordError("");

      if (passwordData) {
        // Ejecución cambio de contraseña
        await userService.changePassword(passwordData);
      } else {
        // Ejecución actualización de datos (Avatar o Info Personal)
        await userService.update(profile.id, {
          ...profile,
          ...editData,
          roleId: profile.roleId,
        });
      }

      setConfirmConfig({ ...confirmConfig, isOpen: false });
      setIsEditAvatarOpen(false);
      setIsEditProfileOpen(false);

      setSuccessConfig({
        isOpen: true,
        title: passwordData
          ? "¡Contraseña actualizada!"
          : "¡Perfil actualizado!",
        desc: passwordData
          ? "Tu acceso ha sido actualizado correctamente."
          : "Los cambios se han guardado correctamente.",
      });

      setPasswordData(null);
      setEditData(null);
      await fetchProfile();
    } catch (error: any) {
      if (passwordData) {
        setConfirmConfig({ ...confirmConfig, isOpen: false });
        const errorMsg =
          error.response?.data?.message ||
          "La contraseña actual no es correcta";
        setServerPasswordError(errorMsg);
      } else {
        alert(error.response?.data?.message || "Error al actualizar el perfil");
      }
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p className="font-medium italic">Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-10">
          <section className="animate-in fade-in slide-in-from-left duration-500">
            <ProfileAvatarCard
              user={profile}
              onEditAvatar={() => {
                setEditData({ avatarURL: profile.avatarURL });
                setIsEditAvatarOpen(true);
              }}
            />
          </section>

          <section className="animate-in fade-in slide-in-from-left duration-700">
            <ProfilePersonalInfoCard
              user={profile}
              onEditPersonal={() => {
                setEditData({
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  phone: profile.phone,
                });
                setIsEditProfileOpen(true);
              }}
            />
          </section>

          <section className="animate-in fade-in slide-in-from-left duration-1000">
            <ProfileAccountInfoCard user={profile} />
          </section>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-10">
          <section className="animate-in fade-in slide-in-from-right duration-500">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-4 ml-1">
              Cambiar Contraseña
            </h2>
            <ChangePasswordCard
              onConfirm={handleChangePasswordTrigger}
              externalError={serverPasswordError}
            />
          </section>

          <section className="animate-in fade-in slide-in-from-right duration-700">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-4 ml-1">
              Equipos a los que pertenezco
            </h2>
            <MyTeamsTableCard affiliations={profile?.affiliations} />
          </section>
        </div>
      </div>

      {/* MODALES DE EDICIÓN */}
      <Modal
        isOpen={isEditAvatarOpen}
        onClose={() => setIsEditAvatarOpen(false)}
        title="Cambiar Foto de Perfil"
        size="sm"
      >
        <form onSubmit={handleUpdateTrigger} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              URL de la Imagen
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              value={editData?.avatarURL || ""}
              onChange={(e) =>
                setEditData({ ...editData, avatarURL: e.target.value })
              }
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>
          <Button variant="primary" className="w-full" type="submit">
            Guardar Imagen
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Editar Información Personal"
      >
        <form onSubmit={handleUpdateTrigger} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Nombre
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                value={editData?.firstName || ""}
                onChange={(e) =>
                  setEditData({ ...editData, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Apellidos
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                value={editData?.lastName || ""}
                onChange={(e) =>
                  setEditData({ ...editData, lastName: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Teléfono
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              value={editData?.phone || ""}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
            />
          </div>
          <Button variant="primary" className="w-full" type="submit">
            Guardar Cambios
          </Button>
        </form>
      </Modal>

      {/* --- DIÁLOGOS DE SISTEMA --- */}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeAction}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmLabel="Confirmar"
        type="warning"
        isLoading={formLoading}
      />

      <SuccessDialog
        isOpen={successConfig.isOpen}
        onClose={() => setSuccessConfig({ ...successConfig, isOpen: false })}
        title={successConfig.title}
        description={successConfig.desc}
      />
    </div>
  );
};

export default ProfilePage;
