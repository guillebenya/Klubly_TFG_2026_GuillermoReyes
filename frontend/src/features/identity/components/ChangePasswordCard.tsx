import React, { useState } from "react";
import { Lock, ShieldCheck, XCircle } from "lucide-react";
import Card from "../../../components/shared/Card";
import Button from "../../../components/shared/Button";

interface ChangePasswordCardProps {
  onConfirm: (passwords: any) => void;
  externalError?: string; // Para mostrar errores que vengan del backend
}

const ChangePasswordCard = ({
  onConfirm,
  externalError,
}: ChangePasswordCardProps) => {
  const initialState = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Limpiar error al escribir
  };

  const handleClear = () => {
    setFormData(initialState);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas en el cliente
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("La nueva contraseña y su repetición no coinciden.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    onConfirm(formData);
  };

  return (
    <Card className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Contraseña Actual */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Lock size={12} /> Contraseña Actual
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="Introduzca la contraseña actual"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
          />
        </div>

        <div className="h-px bg-gray-100 my-2" />

        {/* Nueva Contraseña */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={12} /> Nueva Contraseña
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Nueva contraseña"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
          />
        </div>

        {/* Repetir Contraseña */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={12} /> Repite la nueva contraseña
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repite la contraseña"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
          />
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold animate-shake">
            <XCircle size={14} />
            {error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={handleClear}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Confirmar
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChangePasswordCard;
