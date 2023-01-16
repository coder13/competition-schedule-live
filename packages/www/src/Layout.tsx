import { Container } from 'react-bulma-components';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <>
      <Container breakpoint="mobile">
        <Outlet />
      </Container>
    </>
  );
}

export default Layout;
