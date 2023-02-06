import { Container } from 'react-bulma-components';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from './Providers/UserProvider';

function Layout() {
  const { logout } = useAuth();
  return (
    <>
      <header className="shadow-md">
        <nav>
          <ul className="flex">
            <li className="py-3 px-2 text-green-600">
              <Link to="/">Home</Link>
            </li>
            <div className="flex flex-grow" />
            <li>
              <button className="py-3 px-2 text-red-500" onClick={logout}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </header>
      <Container breakpoint="mobile">
        <Outlet />
      </Container>
    </>
  );
}

export default Layout;
