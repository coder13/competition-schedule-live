import { Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Competition from './pages/Competition';
import Competitions from './pages/Competitions';
import Competitors from './pages/Competitors';
import Home from './pages/Home';
import Login from './pages/Login';
import UserNotifications from './pages/UserNotifications';
import { useAuth } from './Providers/UserProvider';

function App() {
  const { user } = useAuth();
  console.log(13, user);

  if (!user?.id) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competitions/:competitionId" element={<Competition />} />
        <Route path="/competitors" element={<Competitors />} />
        <Route path="/profile">
          <Route
            path="/profile/notifications"
            element={<UserNotifications />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
