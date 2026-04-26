import DashboardHeader from "../components/Dashboard/DashboardHeader";
import SearchBar from "../components/Dashboard/SearchBar";
import Navbar from "../components/Navbar";
import FolderSection from "../components/Dashboard/FolderSection";
import SongListSection from "../components/Dashboard/SongListSection";
import { useState } from "react";

export default function Dashboard() {
    const [refreshFolders, setRefreshFolders] = useState(0);
    return (
        <div className="min-h-screen bg-[#f4f6f8]">
            <Navbar />
        <main className="max-w-[1200px] mx-auto px-6 py-10">
        
        <DashboardHeader onFolderCreated={() => setRefreshFolders(prev => prev + 1)} />
        <SearchBar />
        <FolderSection key = {refreshFolders} />
        <SongListSection/>
        </main>     
        </div>
    )
}