import { useCallback } from 'react';
import { Button } from '@mui/material';
import { useAuth } from '../providers/AuthProvider';

function LoginPage() {
  const { login, jwt } = useAuth();

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {jwt}
      <Button onClick={login}>Login</Button>
    </div>
  );
}

export default LoginPage;
