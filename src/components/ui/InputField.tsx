import { type LucideIcon } from "lucide-react"

interface InputFieldProps {
    label: string;
    placeholder: string;
    type: string;
    icon: LucideIcon;
}

export default function InputField({
    label, 
    placeholder,
    type,
    icon: Icon
}: InputFieldProps) { 
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 pl-1">
              {label}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type={type} 
                placeholder= {placeholder} 
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
    )
}