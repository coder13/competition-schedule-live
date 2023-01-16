import { Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import { useAuth } from './Providers/UserProvider';

function App() {
  const { user } = useAuth();

  console.log(10, user);

  if (!user?.id) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
