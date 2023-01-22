import { Outlet } from 'react-router-dom';
import Footer from './Footer';

function Layout() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-0 p-2 shadow-md">Admin</header>
      <div className="flex flex-1 p-2 overflow-y-auto">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
