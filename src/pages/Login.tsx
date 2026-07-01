import { Mail, Lock } from 'lucide-react';
import Form from '../components/ui/Form';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { isAxiosError } from 'axios';

export default function Login() {
  const navigate = useNavigate();
  
  // Estados para el formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- PARCHE GLOBAL: Destructor de Modales Fantasma ---
  // Nos aseguramos de que al llegar al Login, la pantalla y el scroll estén desbloqueados
  useEffect(() => {
    document.body.style.overflow = 'unset';
    document.body.style.pointerEvents = 'auto';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError('');

    // --- 1. VALIDACIONES FRONTEND (El Escudo) ---
    
    // A. Comprobar campos vacíos
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    // B. Comprobar formato de correo válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, introduce un correo electrónico válido (ejemplo@dominio.com).');
      return;
    }
    // ---------------------------------------------

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        user_email: email,
        user_password: password
      });

      // Guardamos el token en el LocalStorage
      localStorage.setItem('token', response.data.access_token);
      
      // ¡Redirigimos al Dashboard!
      navigate('/dashboard');
      
    } catch (err) {
      // --- 2. MANEJO DE ERRORES INTELIGENTE ---
      if (isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        
        // Error automático de validación de FastAPI (Array)
        if (Array.isArray(detail)) {
          setError(`Error en el campo: ${detail[0].loc[1]} - ${detail[0].msg}`);
        } 
        // Mensaje directo del backend (String)
        else if (typeof detail === 'string') {
          setError(detail);
        } 
        // Fallback genérico
        else {
          setError('Error al iniciar sesión. Verifica tus datos.');
        }
      } else {
        setError('Ocurrió un error inesperado de red.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Fondo oscuro de la pantalla
    <div className="min-h-screen bg-[#242c3d] flex items-center justify-center p-4">
      <Form label="Inicia sesión en Jaye" onSubmit={handleSubmit}>
        <InputField
          label="Correo electrónico"
          placeholder="foo@gmail.com"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          label="Contraseña"
          placeholder="********"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          {error && (
            <p className="text-rose-500 text-xs font-semibold text-center pb-2">{error}</p>
          )}
          <div className="text-center pt-2 pb-3">
            <Link to="/forgot-password" className="text-sm font-bold text-slate-800 hover:text-violet-600 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Button type="submit">
              {isLoading ? 'Cargando...' : 'Iniciar sesión'}
          </Button>
          <div className="text-center pt-3 text-sm text-slate-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-bold text-slate-900 hover:text-violet-600 transition-colors">
              Regístrate aquí
            </Link>
          </div>  
        </div>
      </Form>
    </div>
  );
}