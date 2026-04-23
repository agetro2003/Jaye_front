import { Mail, Lock } from 'lucide-react';
import Form from '../components/ui/Form';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    // Fondo oscuro de la pantalla
    <div className="min-h-screen bg-[#242c3d] flex items-center justify-center p-4">
      <Form label="Inicia sesion en Jaye">
        <InputField
          label="Correo electronico"
          placeholder="foo@gmail.com"
          type="email"
          icon={Mail}
        />
        <InputField
          label="Contraseña"
          placeholder="********"
          type="password"
          icon={Lock}
        />
        <div>
        <div className="text-center pt-2">
          <a href="#" className="text-sm font-bold text-slate-800 hover:text-violet-600 transition-colors">
            Olvidaste tu contraseña
          </a>
        </div>
        <Button type="submit">
          Iniciar sesión
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