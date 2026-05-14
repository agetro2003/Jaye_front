import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Lock, Loader2, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { getApiError } from "../utils/errorHandler";

export default function Profile() {
  const [userData, setUserData] = useState<{ email: string; username?: string } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        // Mantenemos la lógica de Folders, buscando /users/me
        const response = await api.get("/users/me"); 
        if (isMounted) {
          setUserData(response.data);
        }
      } catch (err) {
        console.error("Error cargando usuario", err);
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }
    if (passwords.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/change-password", {
        old_password: passwords.currentPassword, 
        new_password: passwords.newPassword,
      });

      setSuccessMsg("¡Contraseña actualizada correctamente!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      setError(getApiError(err, "Error al actualizar la contraseña"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Navbar />

      {/* Contenedor ancho (max-w-300) igual que Folders */}
      <main className="max-w-300 mx-auto px-6 py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#8b5cf6] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al panel principal
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#8b5cf6] p-2.5 rounded-xl shadow-sm">
            <User className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
        </div>

        {/* --- CAMBIO: Tarjeta Info - Borde oscurecido --- */}
        <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm mb-8 lg:max-w-4xl">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            Información de la cuenta
          </h2>
          {isLoadingUser ? (
            <div className="flex items-center text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <span className="block text-sm font-medium text-slate-600 mb-1">Correo electrónico</span>
                {/* Dato handleado si no hay data (image_3.png) */}
                <span className="text-slate-950 font-bold text-lg break-all">{userData?.email || "No disponible"}</span>
              </div>
              {userData?.username && (
                <div>
                  <span className="block text-sm font-medium text-slate-600 mb-1">Nombre de usuario</span>
                  <span className="text-slate-950 font-bold text-lg break-all">{userData.username}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- CAMBIO: Tarjeta Formulario - Borde oscurecido --- */}
        <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-600" />
            Cambiar Contraseña
          </h2>

          {error && (
            <div className="bg-rose-100 border border-rose-300 text-rose-800 p-4 rounded-xl mb-6 text-sm font-semibold lg:max-w-2xl">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-2.5 lg:max-w-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 lg:max-w-2xl">
            {/* --- CAMBIOS EN INPUTS: Fondo slate-100, borde slate-300, texto slate-800 --- */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Contraseña actual
              </label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all shadow-inner"
                placeholder="Ingresa tu contraseña actual"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all shadow-inner"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all shadow-inner"
                  placeholder="Repite la nueva contraseña"
                />
              </div>
            </div>

            <div className="pt-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl transition-all shadowdisabled:opacity-70 flex items-center justify-center gap-2.5 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Actualizando...
                  </>
                ) : (
                  "Actualizar contraseña"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}