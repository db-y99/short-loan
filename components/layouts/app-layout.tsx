"use client";

import Navbar from "@/components/navbar";

export default function AppLayout({ 
  children,
  onOpenSidebar,
}: { 
  children: React.ReactNode;
  onOpenSidebar?: () => void;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar onOpenSidebar={onOpenSidebar} />
      <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
        {children}
      </main>
    </div>
  );
}