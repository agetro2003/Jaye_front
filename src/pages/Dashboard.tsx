import { useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SearchBar from "../components/dashboard/SearchBar";
import Navbar from "../components/Navbar";
import FolderSection from "../components/dashboard/FolderSection";
import SongListSection from "../components/dashboard/SongListSection";

export default function Dashboard() {
  const [refreshFolders, setRefreshFolders] = useState(0);
  
  // 1. Estados de la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recent-edit");

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Navbar />
      <main className="max-w-300 mx-auto px-6 py-10">
        <DashboardHeader
          onFolderCreated={() => setRefreshFolders((prev) => prev + 1)}
        />
        
        {/* 2. Le pasamos el estado al SearchBar */}
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />
        
        {/* 3. Le pasamos las palabras clave a las secciones */}
        <FolderSection 
          key={refreshFolders} 
          searchTerm={searchTerm} 
          sortOption={sortOption} 
        />
        
        <SongListSection 
          searchTerm={searchTerm} 
          sortOption={sortOption} 
        />
      </main>
    </div>
  );
}