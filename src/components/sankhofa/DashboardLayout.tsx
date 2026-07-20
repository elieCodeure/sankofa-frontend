import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { Toaster } from "@/components/ui/sonner";
import { Menu } from "lucide-react";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dark min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
      {/* Mobile Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-deep/80 backdrop-blur-md border-b border-border/10 flex items-center justify-between px-6 z-50 lg:hidden font-display">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 text-accent hover:bg-accent/10 rounded-full transition-colors"
        >
          <Menu size={24} />
        </button>
        <span className="text-lg tracking-widest text-accent">SAN · KƆ · FA</span>
        <div className="w-8" /> {/* Spacer */}
      </header>

      <div className="flex pt-16 lg:pt-0">
        <DashboardSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <main className="flex-1 w-full lg:ml-64 p-4 md:p-8 relative">
          <Toaster />
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
