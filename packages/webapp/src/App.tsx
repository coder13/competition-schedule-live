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

import { Backdrop, CircularProgress, styled, Typography } from '@mui/material';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Mainbar from './components/Mainbar';
import CompetitionAllRooms from './pages/Competition/AllRooms';
import CompetitionHome from './pages/Competition/Home';
import CompetitionLayout from './pages/Competition/Layout';
import CompetitionRoom from './pages/Competition/Room';
import CompetitionWebhooks from './pages/Competition/Webhooks';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import { useAuth } from './providers/AuthProvider';

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

function Layout() {
  const { authenticating } = useAuth();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}>
      <Mainbar />
      <Offset />
      <Outlet />
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={authenticating}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

function App() {
  const { jwt } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {jwt ? (
          <>
            <Route index element={<Home />} />
            <Route
              path="/competitions/:competitionId/"
              element={<CompetitionLayout />}>
              <Route index element={<CompetitionHome />} />
              <Route path="rooms/all" element={<CompetitionAllRooms />} />
              <Route path="rooms/:roomId" element={<CompetitionRoom />} />
              <Route path="webhooks" element={<CompetitionWebhooks />} />
            </Route>
          </>
        ) : (
          <Route index element={<LoginPage />} />
        )}
        <Route path="*">
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
