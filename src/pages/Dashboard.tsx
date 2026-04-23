import DashboardHeader from "../components/Dashboard/DashboardHeader";
import SearchBar from "../components/Dashboard/SearchBar";
import Navbar from "../components/Navbar";
import FolderSection from "../components/Dashboard/FolderSection";
import SongListSection from "../components/Dashboard/SongListSection";
export default function Dashboard() {
    return (
        <div className="min-h-screen bg-[#f4f6f8]">
            <Navbar />
        <main className="max-w-[1200px] mx-auto px-6 py-10">
        
        <DashboardHeader />
        <SearchBar />
        <FolderSection />
        <SongListSection/>
        </main>     
        </div>
    )
}