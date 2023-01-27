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

import { Backdrop, CircularProgress, Typography } from '@mui/material';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Mainbar from './components/Mainbar';
import CompetitionHome from './pages/Competition/Home';
import CompetitionLayout from './pages/Competition/Layout';
import CompetitionRoom from './pages/Competition/Room';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import { useAuth } from './providers/AuthProvider';

function Layout() {
  const { authenticating } = useAuth();

  return (
    <>
      <Mainbar />
      <Outlet />
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={authenticating}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
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
              <Route path="rooms/:roomId" element={<CompetitionRoom />} />
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
