import Form from '../components/ui/Form';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { Mail, User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Register() {

return (
        <div className="min-h-screen bg-[#242c3d] flex items-center justify-center p-4">
            <Form label="Crea tu cuenta en Jaya">

                <InputField
                    label="Nombre completo"
                    type="text"
                    placeholder="John Doe"
                    icon={User}
                />

                <InputField
                    label="Correo electronico"
                    type="email"
                    placeholder="foo@gmail.com"
                    icon={Mail}
                />
                <InputField
                    label="Contraseña"
                    type="password"
                    placeholder="********"
                    icon={Lock}
                />
                <InputField 
                    label="Confirmar contraseña"
                    type="password"
                    placeholder="********"
                    icon={Lock}
                />
                <div>   
                    <Button type="submit">
                        Crear cuenta
                    </Button>
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