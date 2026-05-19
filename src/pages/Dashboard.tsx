import { useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SearchBar from "../components/dashboard/SearchBar";
import Navbar from "../components/Navbar";
import FolderSection from "../components/dashboard/FolderSection";
import SongListSection from "../components/dashboard/SongListSection";

export default function Dashboard() {
  // --- AHORA ES UN TRIGGER GLOBAL ---
  const [globalUpdateTrigger, setGlobalUpdateTrigger] = useState(0);
  
  // Cualquier cambio en la app dispara este interruptor
  const handleDataChanged = () => setGlobalUpdateTrigger((prev) => prev + 1);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recent-edit");

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Navbar />
      <main className="max-w-300 mx-auto px-6 py-10">
        <DashboardHeader
          onFolderCreated={handleDataChanged} 
          refreshTrigger={globalUpdateTrigger} 
        />
        
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />
        
        <FolderSection 
          key={`folder-section-${globalUpdateTrigger}`} // Si cambia, recarga carpetas
          searchTerm={searchTerm} 
          sortOption={sortOption} 
          onFolderChange={handleDataChanged} 
        />
        
        <SongListSection 
          key={`song-section-${globalUpdateTrigger}`} // Si cambia, recarga canciones
          searchTerm={searchTerm} 
          sortOption={sortOption} 
          onSongChange={handleDataChanged} // <-- NUEVO: Canciones avisan al padre
        />
      </main>
    </div>
  );
}