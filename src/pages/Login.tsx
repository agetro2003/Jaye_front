import { Mail, Lock } from 'lucide-react';
import Form from '../components/ui/Form';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
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


  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError('');
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
      
    }catch (err) {

      if (isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Error al iniciar sesión. Verifica tus datos.');
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
      <Form label="Inicia sesion en Jaye" onSubmit={handleSubmit}>
        <InputField
          label="Correo electronico"
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
            <p className="text-rose-500 text-xs font-semibold text-center">{error}</p>
          )}
        <div className="text-center pt-2">
          <a href="#" className="text-sm font-bold text-slate-800 hover:text-violet-600 transition-colors">
            Olvidaste tu contraseña
          </a>
        </div>
        <Button type="submit">
            {isLoading ? 'Cargando...' : 'Iniciar sesión'}
        </Button>
        <div className="text-center pt-2 text-sm text-slate-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-bold text-slate-900 hover:text-violet-600 transition-colors">
            Registrate aqui
          </Link>
        </div>  

        </div>
       
      </Form>

    </div>
  );
}