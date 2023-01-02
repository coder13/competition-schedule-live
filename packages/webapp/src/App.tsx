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

import { Outlet, Route, Routes } from 'react-router-dom';
import Mainbar from './components/Mainbar';
import LoginPage from './pages/Login';

function Layout() {
  return (
    <>
      <Mainbar />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LoginPage />} />
        <Route path="competitions" element={<div>Competitions</div>} />
        <Route path="import" element={<div>Competitions</div>} />
      </Route>
    </Routes>
  );
}

export default App;