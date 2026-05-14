import Form from '../components/ui/Form';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { Mail, User, Lock, CheckCircle2 } from 'lucide-react'; // <-- Añadido CheckCircle2
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { isAxiosError } from 'axios';
import api from '../api/axios';
// Asegúrate de que la ruta al Modal sea correcta según tu estructura
import Modal from '../components/ui/Modal'; 

export default function Register() {
  const navigate = useNavigate();

  // Estados del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- NUEVO: Estado para controlar el modal de éxito ---
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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
      await api.post('/auth/register', {
        user_name: name,
        user_email: email,
        user_password: password
      });

      // 3. Éxito: En lugar de redirigir bruscamente, abrimos el modal
      setIsSuccessModalOpen(true);
      
    } catch (err) {
      if (isAxiosError(err)) {
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
      <Form label="Crea tu cuenta en Jaye" onSubmit={handleSubmit}>

        <InputField
          label="Nombre completo"
          type="text"
          placeholder="John Doe"
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <InputField
          label="Correo electrónico"
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
            {isLoading ? 'Creando cuenta...' : 'Crear usuario'}                    
          </Button>
          <div className="text-center pt-2 text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
            <Link to="/" className="font-bold text-slate-900 hover:text-violet-600 transition-colors">
              Inicia sesión aquí
            </Link>
          </div>  
        </div>
      </Form>

      {/* --- NUEVO: Modal de Registro Exitoso --- */}
      <Modal 
        isOpen={isSuccessModalOpen} 
        // Si el usuario hace clic fuera o en la X, lo mandamos al login también
        onClose={() => navigate('/')} 
        title="¡Registro exitoso!" 
        icon={<CheckCircle2 className="w-6 h-6" />}
      >
        <div className="text-center pb-2">
          <p className="text-slate-600 mb-8 font-medium">
            Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión para empezar a componer y organizar tu música.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </Modal>

    </div>
  );
}