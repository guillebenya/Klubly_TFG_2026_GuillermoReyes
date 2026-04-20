import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Tag,
  Link,
  Lock,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import Button from "../../../components/shared/Button";

interface MemberFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void; // Nueva prop para cerrar la modal
  loading?: boolean;
}

const MemberForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: MemberFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(""); // Estado para repetir pass
  const [passwordError, setPasswordError] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    clubPosition: "",
    avatarURL: "",
    roleId: 3,
    active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, password: "" });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    // Si estamos escribiendo en password, resetear el error
    if (name === "password") setPasswordError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de contraseñas
    if (
      formData.password !== confirmPassword &&
      (!initialData || formData.password !== "")
    ) {
      setPasswordError(true);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre de Usuario */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              placeholder="perez.juan"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              placeholder="ejemplo@klubly.com"
              required
            />
          </div>
        </div>

        {/* Nombre */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Nombre
          </label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            required
          />
        </div>

        {/* Apellidos */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Apellidos
          </label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border ${passwordError ? "border-red-500" : "border-gray-200"} rounded-xl focus:ring-2 outline-none text-sm`}
              required={!initialData}
            />
          </div>
        </div>

        {/* Repetir Password */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Repetir Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(false);
              }}
              className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border ${passwordError ? "border-red-500" : "border-gray-200"} rounded-xl focus:ring-2 outline-none text-sm`}
              required={!initialData || formData.password !== ""}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {passwordError && (
          <p className="text-red-500 text-[10px] font-bold uppercase md:col-span-2 ml-1">
            Las contraseñas no coinciden
          </p>
        )}

        {/* Teléfono */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Teléfono
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Cargo en el Club */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Cargo Club
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              name="clubPosition"
              value={formData.clubPosition}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              placeholder="Ej: Presidente, Tesorero..."
            />
          </div>
        </div>

        {/* Avatar URL */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            URL Avatar (String)
          </label>
          <div className="relative">
            <Link className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              name="avatarURL"
              value={formData.avatarURL}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-mono text-indigo-600"
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>
        </div>

        {/* Rol */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Rol
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
            >
              <option value={1}>ADMIN</option>
              <option value={2}>STAFF</option>
              <option value={3}>MEMBER</option>
            </select>
          </div>
        </div>

        {/* Estado Activo */}
        <div className="flex items-center gap-3 mt-6">
          <input
            name="active"
            type="checkbox"
            checked={formData.active}
            onChange={handleChange}
            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label className="text-sm font-bold text-gray-700 cursor-pointer">
            Usuario Activo
          </label>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          icon={<X size={18} />}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={loading}>
          {initialData ? "Guardar Cambios" : "Crear Miembro"}
        </Button>
      </div>
    </form>
  );
};

export default MemberForm;
