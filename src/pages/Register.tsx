import Form from '../components/ui/Form';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { Mail, User, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { isAxiosError } from 'axios';
import api from '../api/axios';
export default function Register() {
 const navigate = useNavigate();

  // Estados del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validación Frontend: Comprobar que las contraseñas coinciden
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Petición al backend
      // (Revisa que los nombres coincidan con tu esquema UserCreate en FastAPI)
      await api.post('/auth/register', {
        user_name: name,
        user_email: email,
        user_password: password
      });

      // 3. Éxito: Redirigimos al Login. 
      // Podríamos pasar un estado para mostrar un mensaje verde en el Login, 
      // pero por ahora lo mandamos directamente.
      navigate('/');
      
    } catch (err) {
      if (isAxiosError(err)) {
        // Ejemplo: El backend puede devolver 400 si el email ya existe
        setError(err.response?.data?.detail || 'Error al crear la cuenta. Inténtalo de nuevo.');
      } else {
        setError('Ocurrió un error inesperado de red.');
      }
    } finally {
      setIsLoading(false);
    }
  };
return (
        <div className="min-h-screen bg-[#242c3d] flex items-center justify-center p-4">
            <Form label="Crea tu cuenta en Jaya" onSubmit={handleSubmit}>

                <InputField
                    label="Nombre completo"
                    type="text"
                    placeholder="John Doe"
                    icon={User}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <InputField
                    label="Correo electronico"
                    type="email"
                    placeholder="foo@gmail.com"
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <InputField
                    label="Contraseña"
                    type="password"
                    placeholder="********"
                    icon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <InputField 
                    label="Confirmar contraseña"
                    type="password"
                    placeholder="********"
                    icon={Lock}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div>   
                    {error && (
                      <p className="text-rose-500 text-xs font-semibold text-center">{error}</p>
                    )}
                    <Button type="submit">
                      {isLoading ? 'Creando cuenta...' : 'Crear usuario'}                    </Button>
                    <div className="text-center pt-2 text-sm text-slate-600">
                    ¿Ya tienes cuenta?{' '}
                        <Link to="/" className="font-bold text-slate-900 hover:text-violet-600 transition-colors">
                          Inicia sesion aqui
                        </Link>
                    </div>  
                </div>
                

            </Form>
        </div>

)
}