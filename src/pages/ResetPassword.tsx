import { Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Form from '../components/ui/Form';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';
import { isAxiosError } from 'axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Si alguien llega a esta página sin token en la URL (o lo manipuló),
  // se lo dejamos claro de inmediato en vez de mostrar un formulario inútil.
  if (!token) {
    return (
      <div className="min-h-screen bg-[#242c3d] flex items-center justify-center p-4">
        <Form label="Enlace no válido">
          <div className="text-center py-2">
            <div className="flex justify-center mb-4">
              <div className="bg-rose-100 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed px-2">
              Este enlace de recuperación no es válido. Asegúrate de usar el enlace completo que recibiste por correo.
            </p>
            <div className="pt-6">
              <Link
                to="/forgot-password"
                className="font-bold text-sm text-slate-800 hover:text-violet-600 transition-colors"
              >
                Solicitar un nuevo enlace
              </Link>
            </div>
          </div>
        </Form>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: newPassword
      });

      setIsDone(true);

      // Redirigimos al login tras unos segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      if (isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        // El token expiró, ya se usó, o es inválido
        setError(typeof detail === 'string' ? detail : 'No se pudo restablecer la contraseña.');
      } else {
        setError('Ocurrió un error inesperado de red.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#242c3d] flex items-center justify-center p-4">
      <Form label="Crea tu nueva contraseña" onSubmit={handleSubmit}>

        {isDone ? (
          // --- Vista de éxito ---
          <div className="text-center py-2">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">¡Contraseña actualizada!</h2>
            <p className="text-sm text-slate-500 leading-relaxed px-2">
              Ya puedes iniciar sesión con tu nueva contraseña. Te redirigiremos automáticamente...
            </p>
          </div>
        ) : (
          // --- Formulario ---
          <>
            <InputField
              label="Nueva contraseña"
              placeholder="********"
              type="password"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <InputField
              label="Confirmar contraseña"
              placeholder="********"
              type="password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div>
              {error && (
                <p className="text-rose-500 text-xs font-semibold text-center pb-2 pt-2">{error}</p>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
              </Button>
              <div className="text-center pt-3 text-sm text-slate-600">
                <Link to="/" className="font-bold text-slate-900 hover:text-violet-600 transition-colors">
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </>
        )}

      </Form>
    </div>
  );
}