import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { authService } from "../../auth/services/auth.service";
import { userService } from "../services/user.service";
import ProfileAvatarCard from "../components/ProfileAvatarCard";
import ProfilePersonalInfoCard from "../components/ProfilePersonalInfoCard";

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados para los modales de edición
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
  try {
    setLoading(true);
    const currentUser = authService.getCurrentUser();
    console.log("1. Usuario en LocalStorage:", currentUser); // <--- LOG 1

    if (currentUser?.username) {
      const response = await userService.getByUsername(currentUser.username);
      console.log("2. Respuesta del Servidor:", response.data); // <--- LOG 2
      setProfile(response.data);
    } else {
      console.warn("No se encontró username en el LocalStorage");
    }
  } catch (error) {
    console.error("Error al cargar el perfil:", error);
  } finally {
    setLoading(false);
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Layout de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-10">
          {/* Aquí irán: Mi Perfil (Avatar), Inf. Personal e Inf. de Cuenta */}
          <section className="animate-in fade-in slide-in-from-left duration-500">
            {/* 1. Bloque Mi Perfil */}
            <ProfileAvatarCard 
                user={profile} 
                onEditAvatar={() => {
                    console.log("Abrir modal de avatar");
                    setIsEditAvatarOpen(true);
                }} 
            />
          </section>

          <section className="animate-in fade-in slide-in-from-left duration-700">
            {/* 2. Bloque Información Personal */}
            <ProfilePersonalInfoCard user={profile} />
          </section>

          <section className="animate-in fade-in slide-in-from-left duration-1000">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-4 ml-1">
              Información de Cuenta
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              {/* Espacio para AccountInfoCard */}
              <div className="h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                Componente Info Cuenta
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-8">
          {/* Aquí irán: Cambiar Contraseña y Mis Equipos */}
          <section className="animate-in fade-in slide-in-from-right duration-500">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-4 ml-1">
              Cambiar Contraseña
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              {/* Espacio para ChangePasswordCard */}
              <div className="h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                Componente Contraseña
              </div>
            </div>
          </section>

          <section className="animate-in fade-in slide-in-from-right duration-700">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-4 ml-1">
              Equipos a los que pertenezco
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              {/* Espacio para MyTeamsTableCard */}
              <div className="h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                Componente Tabla Equipos
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
