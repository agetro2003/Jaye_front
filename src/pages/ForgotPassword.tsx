import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Form from '../components/ui/Form';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // El backend siempre responde 200 (exista o no el correo), así que
  // usamos un estado de "enviado" en vez de mostrar un mensaje de error.
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor, introduce tu correo electrónico.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, introduce un correo electrónico válido (ejemplo@dominio.com).');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', {
        user_email: email
      });
      setIsSent(true);
    } catch (err) {
      // En este caso sí mostramos un error genérico de red, ya que el
      // backend nunca debería devolver un 400/404 a propósito aquí.
      console.error(err);
      setError('Ocurrió un error inesperado. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#242c3d] flex items-center justify-center p-4">
      <Form label="Recupera el acceso a tu cuenta" onSubmit={handleSubmit}>
        
        {isSent ? (
          // --- Vista de confirmación ---
          <div className="text-center py-2">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Revisa tu correo</h2>
            <p className="text-sm text-slate-500 leading-relaxed px-2">
              Si <span className="font-semibold text-slate-700">{email}</span> está registrado en Jaye,
              te hemos enviado un enlace para restablecer tu contraseña. Caduca en 15 minutos.
            </p>
            <div className="pt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-violet-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
          // --- Formulario de solicitud ---
          <>
            <p className="text-sm text-slate-500 text-center -mt-2 mb-3 px-2">
              Introduce el correo con el que te registraste y te enviaremos un enlace para crear una nueva contraseña.
            </p>
            <InputField
              label="Correo electrónico"
              placeholder="foo@gmail.com"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              {error && (
                <p className="text-rose-500 text-xs font-semibold text-center pb-2 pt-2">{error}</p>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
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