interface ButtonProps {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
}

export default function Button({ children, type = "button", onClick }: ButtonProps) {
    return (
        <button 
            type={type} 
            className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-2.5 rounded-xl font-semibold text-[15px] transition-colors mt-2"
            onClick={onClick}
        >
            {children}
        </button>
    )
}