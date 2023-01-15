import { Route, Routes } from 'react-router-dom';
import Login from './Login';

function App() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100%',
      }}>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
