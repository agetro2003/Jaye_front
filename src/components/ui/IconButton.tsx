import type { LucideIcon } from "lucide-react";


interface IconButtonProps {
    icon: LucideIcon;
    text: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
}
export default function IconButton(
    {
    icon: Icon,
    text,
    variant = 'primary',
    onClick
    }: IconButtonProps
){
const baseStyles = "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all";

const variantStyles = variant === 'primary' 
? "bg-[#8b5cf6] hover:bg-[#5c3aed] text-white shadow-sm"
    : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-sm";
return (
    <button onClick={onClick} className={`${baseStyles} ${variantStyles}`}>
      <Icon className="w-4 h-4" />
      <span>{text}</span>
    </button>
  );
}

