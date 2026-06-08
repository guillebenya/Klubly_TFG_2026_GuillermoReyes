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
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import {
  roleService,
  type Role,
} from "../../configuration/services/role.service";
import { authService } from "../../auth/services/auth.service";

interface MemberFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  isRegistration?: boolean; // Prop para modo registro público
}

//Componentes fuera de MemberForm para reducir complejidad
const PendingUserBanner = () => (
  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3 mb-2">
    <CheckCircle className="text-emerald-500 shrink-0" size={18} />
    <p className="text-[11px] text-emerald-700 font-medium">
      Este usuario ha solicitado unirse al club. Al guardar los cambios, se le
      asignará el rol y cargo indicados y podrá acceder a la plataforma.
    </p>
  </div>
);

const SelfEditBanner = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 mb-2">
    <AlertCircle className="text-amber-500 shrink-0" size={18} />
    <p className="text-[11px] text-amber-700 font-medium">
      Estás editando tu propio perfil. Por seguridad, no puedes modificar tu rol
      ni desactivar tu cuenta.
    </p>
  </div>
);

const StaffOnlyFields = ({
  isSelf,
  loadingRoles,
  roles,
  formData,
  onRoleChange,
  onActiveToggle,
}: {
  isSelf: boolean | null;
  loadingRoles: boolean;
  roles: Role[];
  formData: { roleId: number; active: boolean; clubPosition: string };
  onRoleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onActiveToggle: () => void;
}) => (
  <>
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
        Cargo Club{" "}
        <span className="text-[10px] text-gray-400 font-medium italic leading-tight">
          (Opcional)
        </span>
      </label>
      <div className="relative">
        <Tag className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          name="clubPosition"
          value={formData.clubPosition}
          onChange={onRoleChange}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
          placeholder="Ej: Socio, Delegado..."
        />
      </div>
    </div>

    <div className="space-y-1">
      <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
        Rol {isSelf && "(Bloqueado)"}
        <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
        <select
          name="roleId"
          value={formData.roleId}
          onChange={onRoleChange}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
          disabled={loadingRoles || !!isSelf}
          required
        >
          {loadingRoles ? (
            <option>Cargando roles...</option>
          ) : (
            roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name.toUpperCase()}
              </option>
            ))
          )}
        </select>
      </div>
    </div>

    <div className="flex items-start pt-7">
      <button
        type="button"
        role="switch"
        aria-checked={formData.active}
        aria-label="Alternar estado del usuario"
        onClick={onActiveToggle}
        disabled={!!isSelf}
        className={`flex items-center gap-3 select-none w-fit ${isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div
          className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${formData.active ? "bg-indigo-600" : "bg-gray-300"}`}
        >
          <div
            className={`bg-white w-3 h-3 rounded-full transform transition-transform duration-300 ${formData.active ? "translate-x-5" : "translate-x-0"}`}
          />
        </div>
        <div className="flex flex-col text-left">
          <span
            className={`text-sm font-bold uppercase tracking-tight transition-colors ${formData.active ? "text-gray-700" : "text-gray-500"}`}
          >
            {formData.active ? "Usuario Activo" : "Usuario Inactivo"}
          </span>
          {isSelf && (
            <span className="text-[10px] font-medium text-indigo-500 italic leading-none mt-0.5">
              No puedes desactivar tu propia cuenta
            </span>
          )}
        </div>
      </button>
    </div>
  </>
);

const MemberForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
  isRegistration = false,
}: MemberFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordMinError, setPasswordMinError] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

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
    active: !isRegistration,
    isPending: isRegistration,
  });

  //Variables para reducir complejidad
  const currentUser = authService.getCurrentUser();
  const isSelf =
    initialData && currentUser && initialData.id === currentUser.id;

  const isInitialData = initialData ? "Guardar Cambios" : "Crear Miembro";
  const submitLabel = isRegistration ? "Crear Cuenta" : isInitialData;
  const submitVariant = isRegistration || initialData ? "primary" : "add";

  const isEditMode = !!initialData && !isRegistration;
  const isNewOrRegistration = !initialData || isRegistration;
  const passwordRequired = isNewOrRegistration;
  const showEditHint = !!initialData && !isRegistration;
  const confirmPasswordRequired =
    formData.password.length > 0 || isNewOrRegistration;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await roleService.getAll();
        setRoles(response.data);
      } catch (error) {
        console.error("Error cargando roles:", error);
      } finally {
        setLoadingRoles(false);
      }
    };

    if (!isRegistration) fetchRoles();
  }, [isRegistration]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: "",
        phone: initialData.phone || "",
        clubPosition: initialData.clubPosition || "",
        avatarURL: initialData.avatarURL || "",
        active: initialData.isPending ? true : initialData.active,
      });
    }
  }, [initialData]);

  const parseInputValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") return e.target.checked;
    if (name === "roleId") return Number.parseInt(value);
    return value;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    let value = parseInputValue(e);

    // Filtra en tiempo real: limpia todo lo que no sea un número
    if (e.target.name === "phone" && typeof value === "string") {
      value = value.replace(/\D/g, ""); // Borra cualquier cosa que no sea dígito
      setPhoneError(false);
    }

    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
    if (e.target.name === "password") setPasswordError(false);
  };

  const isPasswordValid = () => {
    const hasPassword = formData.password.length > 0;
    const isNewUser = !initialData || isRegistration;
    if (hasPassword || isNewUser) {
      return formData.password === confirmPassword;
    }
    return true;
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    //Validación formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setEmailError(true);
      return;
    }

    //Validación mínimo 6 caracteres para contraseña (solo si se ha escrito algo o es un nuevo usuario)
    const shouldCheckLength =
      isNewOrRegistration || formData.password.length > 0;
    if (shouldCheckLength && formData.password.length < 6) {
      setPasswordMinError(true);
      return;
    }

    //Validación: Solo comprobamos si coinciden si el usuario ha escrito algo
    //o si es un registro/creación nueva (donde es obligatorio)
    if (!isPasswordValid()) {
      setPasswordError(true);
      return;
    }

    //Validación teléfono: Si el campo no está vacío, debe tener exactamente 9 dígitos
    const phoneValue = (formData.phone || "").trim();
    if (phoneValue.length > 0 && !/^\d{9}$/.test(phoneValue)) {
      setPhoneError(true);
      return;
    }

    const submissionData = {
      ...formData,
      isPending: initialData?.isPending ? false : formData.isPending,
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isSelf && !isRegistration && <SelfEditBanner />}

      {initialData?.isPending && !isRegistration && <PendingUserBanner />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Username<span className="text-red-500">*</span>
          </span>
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

        <div className="space-y-1">
          <label
            htmlFor="email"
            className="text-[11px] font-bold text-gray-500 uppercase ml-1"
          >
            Email<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${
                emailError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:ring-indigo-500"
              } rounded-xl focus:ring-2 outline-none transition-all text-sm`}
              placeholder="ejemplo@klubly.com"
              required
            />
          </div>
          {emailError && (
            <p className="text-red-500 text-[10px] font-bold uppercase ml-1">
              El correo debe incluir un dominio válido (ej: usuario@dominio.com)
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="firstName"
            className="text-[11px] font-bold text-gray-500 uppercase ml-1"
          >
            Nombre<span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="lastName"
            className="text-[11px] font-bold text-gray-500 uppercase ml-1"
          >
            Apellidos<span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <div className="flex flex-col ml-1">
            <label className="text-[11px] font-bold text-gray-500">
              Contraseña{" "}
              {isNewOrRegistration && <span className="text-red-500">*</span>}
            </label>
            {showEditHint && (
              <span className="text-[10px] text-gray-400 font-medium italic leading-tight">
                Dejar en blanco para no modificar
              </span>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border ${
                passwordError || passwordMinError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:ring-indigo-500"
              } rounded-xl focus:ring-2 outline-none text-sm`}
              required={passwordRequired}
              placeholder={isEditMode ? "••••••••" : "Mínimo 6 caracteres"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordMinError && (
            <p className="text-red-500 text-[10px] font-bold uppercase ml-1">
              La contraseña debe tener al menos 6 caracteres
            </p>
          )}
        </div>

        {/* Repetir Password */}
        <div className="space-y-1">
          <div className="flex flex-col ml-1">
            <label className="text-[11px] font-bold text-gray-500">
              Repetir Contraseña
              {isNewOrRegistration && <span className="text-red-500">*</span>}
            </label>

            {/* Mensaje de ayuda debajo (solo en edición) */}
            {showEditHint && (
              <span className="text-[10px] text-gray-400 font-medium italic leading-tight">
                Dejar en blanco para no modificar
              </span>
            )}
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type={showRepeatPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(false);
              }}
              className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border ${
                passwordError ? "border-red-500" : "border-gray-200"
              } rounded-xl focus:ring-2 outline-none text-sm`}
              required={confirmPasswordRequired}
              placeholder={isEditMode ? "••••••••" : "Repite la contraseña"}
            />
            <button
              type="button"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {showRepeatPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {passwordError && (
          <p className="text-red-500 text-[10px] font-bold uppercase md:col-span-2 ml-1">
            Las contraseñas no coinciden
          </p>
        )}

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Teléfono{" "}
            <span className="text-[10px] text-gray-400 font-medium italic leading-tight">
              (Opcional)
            </span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={9}
              placeholder="Ej: 612345678"
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${
                phoneError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:ring-indigo-500"
              } rounded-xl focus:ring-2 outline-none transition-all text-sm`}
            />
          </div>
          {phoneError && (
            <p className="text-red-500 text-[10px] font-bold uppercase ml-1">
              El teléfono debe tener exactamente 9 dígitos
            </p>
          )}
        </div>

        <div className="space-y-1 md:col-span-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            URL Avatar (String){" "}
            <span className="text-[10px] text-gray-400 font-medium italic leading-tight">
              (Opcional)
            </span>
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

        {!isRegistration && (
          <StaffOnlyFields
            isSelf={isSelf}
            loadingRoles={loadingRoles}
            roles={roles}
            formData={formData}
            onRoleChange={handleChange}
            onActiveToggle={() => {
              if (!isSelf)
                setFormData((prev) => ({ ...prev, active: !prev.active }));
            }}
          />
        )}
      </div>

      <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          icon={<X size={18} />}
        >
          {isRegistration ? "Volver al Login" : "Cancelar"}
        </Button>
        <Button type="submit" variant={submitVariant} isLoading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default MemberForm;
