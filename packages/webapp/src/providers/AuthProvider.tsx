import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthContext {
  login: () => void;
  jwt?: string;
}

const AuthContext = createContext<AuthContext>({} as AuthContext);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [jwt, setJWT] = useState<string>(localStorage.getItem('jwt') || '');
  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const login = useCallback(() => {
    const redirectUri = window.location.href;
    localStorage.setItem('redirectUri', redirectUri);
    const query = new URLSearchParams({
      redirect_uri: redirectUri,
    });
    window.location.href = `http://localhost:8080/auth/wca?${query.toString()}`;
  }, [location]);

  useEffect(() => {
    if (!query) {
      return;
    }

    const code = query.get('code');

    if (code) {
      const queryString = new URLSearchParams({
        code,
        redirect_uri:
          localStorage.getItem('redirectUri') || window.location.href,
      });
      navigate(location.pathname);

      fetch(`http://localhost:8080/auth/wca/callback?${queryString.toString()}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to authenticate');
          }

          return res.json();
        })
        .then((data) => {
          console.log('Data', data);
          setJWT(data.jwt);
          localStorage.setItem('jwt', data.jwt);
        });
    }
  }, [query]);

  return (
    <AuthContext.Provider value={{ jwt, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
