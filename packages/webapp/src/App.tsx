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
import CompetitionHome from './pages/Competition/Home';
import CompetitionLayout from './pages/Competition/Layout';
import CompetitionRoom from './pages/Competition/Room';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import { useAuth } from './providers/AuthProvider';

function Layout() {
  return (
    <>
      <Mainbar />
      <Outlet />
    </>
  );
}

function App() {
  const { jwt } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={jwt ? <Home /> : <LoginPage />} />
        <Route
          path="/competitions/:competitionId/"
          element={<CompetitionLayout />}>
          <Route index element={<CompetitionHome />} />
          <Route path="rooms/:roomId" element={<CompetitionRoom />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
