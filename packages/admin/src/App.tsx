import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './Layout/Layout';
import Competition from './pages/Competition';
import Home from './pages/Home';
import Login from './pages/Login';

const key = 'jwt';
function App() {
  const [jwt, setJwt] = useState(localStorage.getItem(key));

  const onSetJwt = (jwt: string) => {
    setJwt(jwt);
    localStorage.setItem(key, jwt);
  };

  if (!jwt) {
    return <Login setJwt={onSetJwt} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/competitions/:competitionId" element={<Competition />} />
        <Route path="/users/:userId" element={<div>User page</div>} />
      </Route>
    </Routes>
  );
}

export default App;
