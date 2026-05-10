import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import MemberForm from "../../identity/components/MemberForm";
import { authService } from "../services/auth.service";
import logo from "../../../assets/Klubly_Logo.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (formData: any) => {
    try {
      setLoading(true);
      setError(null);

      await authService.register(formData);

      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Ocurrió un error al procesar el registro. Inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-500 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <img src={logo} alt="Klubly Logo" className="mx-auto mb-4 w-32" />
            </div>
            <h2 className="mt-1 text-center text-2xl font-bold text-black tracking-tight">
              Únete al Club
            </h2>
            <p className="mt-2 mb-8 text-center text-slate-500">
              ¡Crea tu cuenta ahora!
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center font-medium">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <CheckCircle2
                className="mx-auto text-emerald-500 mb-4"
                size={64}
              />
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                ¡Solicitud Enviada!
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Tu cuenta ha sido creada con éxito, pero un administrador debe
                activarla antes de que puedas iniciar sesión.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <MemberForm
              onSubmit={handleRegister}
              onCancel={() => navigate("/login")}
              loading={loading}
              isRegistration={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
