import { Music } from "lucide-react";

interface FormProps {
    children: React.ReactNode;
    label: string;
}

export default function Form({ children, label }: FormProps) {
    return (
            <div className="bg-[#f8f9fc] w-full max-w-[420px] p-4 md:p-5 rounded-3xl shadow-xl">
        
        {/* Cabecera (Icono y Textos) */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#242c3d] p-4 rounded-2xl mb-4">
            <Music className="text-white w-7 h-7" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#3a445c] mb-2">
            Bienvenido
          </h1>
          <p className="text-slate-500 font-semibold text-lg">
            {label}
          </p>
        </div>

        {/* Formulario */}
        <form className="space-y-3">
            {children}

        </form>
      </div>
    )
}