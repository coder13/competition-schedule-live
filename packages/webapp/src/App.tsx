/**
 * Design for mobile first
 *
 *
 * Pages needed
 * - Projector screen
 * - External user authentication flow and screens
 * - Competition owner user authentication flow
 * Maybe first page should ask them if they want to subscribe for notifications or manage competitions
 *
 * Competition owner flow:
 * - Login
 * - View own competitions
 * - View competition details
 * - View competition rooms
 * - Manage ongoing activities for room
 *
 */

import { Container } from '@mui/material';
import { Outlet, Route, Routes } from 'react-router-dom';
import Mainbar from './components/Mainbar';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import { useAuth } from './providers/AuthProvider';

function Layout() {
  return (
    <>
      <Mainbar />
      <Container maxWidth="md">
        <Outlet />
      </Container>
    </>
  );
}

function App() {
  const { jwt } = useAuth();
  console.log(37, jwt);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={jwt ? <Home /> : <LoginPage />} />
        <Route path="competitions" element={<div>Competitions</div>} />
        <Route path="import" element={<div>Competitions</div>} />
      </Route>
    </Routes>
  );
}

export default App;
