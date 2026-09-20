import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';

function Layout() {
  const { collapsed } = useSidebar();
  const sidebarW = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Sticky glass header */}
      <Header />

      {/* Below header */}
      <div className="flex" style={{ paddingTop: 'var(--header-height)' }}>
        {/* Sidebar spacer — pushes content on desktop */}
        <div
          className="hidden md:block shrink-0 content-transition"
          style={{ width: sidebarW }}
        />

        {/* Actual sidebar (fixed) */}
        <Sidebar />

        {/* Page content */}
        <main className="flex-1 min-w-0 px-4 py-5 sm:px-5 lg:px-6 max-w-[1600px] fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <SidebarProvider>
      <Layout />
    </SidebarProvider>
  );
}
