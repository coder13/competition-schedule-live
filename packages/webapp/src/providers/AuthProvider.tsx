import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import formatDuration from 'date-fns/formatDuration';
import { User } from '../types';

const API_URL = import.meta.env.VITE_API_ORIGIN;
const WCA_URL = import.meta.env.VITE_WCA_API_ORIGIN;

console.log('API_URL', API_URL);

interface AuthContext {
  login: () => void;
  logout: () => void;
  jwt?: string;
  user?: User | null;
  wcaApiFetch: <T>(url: RequestInfo, options?: RequestInit) => Promise<T>;
  authenticating: boolean;
}

const AuthContext = createContext<AuthContext>({} as AuthContext);

function parseJwt(token: string): User {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [authenticating, setAuthenticating] = useState(false);
  const [jwt, setJWT] = useState<string | undefined>(
    localStorage.getItem('jwt') || undefined
  );
  const user = useMemo(() => (jwt ? parseJwt(jwt) : undefined), [jwt]);
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
    window.location.href = `${API_URL}/auth/wca?${query.toString()}`;
  }, [location]);

  const myApiFetch = useCallback(
    (url: RequestInfo, { headers = {}, ...options } = {} as RequestInit) =>
      fetch(`${API_URL}${url}`, {
        ...(jwt && {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
            ...headers,
          },
        }),
        ...options,
      }),
    [jwt]
  );

  const basicWcaApiFetch = useCallback(
    async (
      url: RequestInfo,
      { headers = {}, ...options } = {} as RequestInit
    ) => {
      const res = await fetch(`${WCA_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.wca.accessToken}`,
          ...headers,
        },
        ...options,
      });

      if (!res.ok) {
        console.error(await res.json());
        return;
      }

      return res.json();
    },
    [user]
  );

  const wcaApiFetch = useCallback(
    async (
      url: RequestInfo,
      { headers = {}, ...options } = {} as RequestInit
    ) => {
      const res = await fetch(`${WCA_URL}${url}`, {
        ...(user?.wca.accessToken && {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.wca.accessToken}`,
            ...headers,
          },
        }),
        ...options,
      });

      if (!res.ok) {
        console.error(await res.json());
        return;
      }

      return res.json();
    },
    [user]
  );

  const logout = useCallback(() => {
    setJWT(undefined);
    localStorage.removeItem('jwt');
  }, []);

  const refreshToken = useCallback(async () => {
    if (!user) {
      return;
    }

    console.log('refreshing', user?.wca.expiration - 1000 * 10);
    setAuthenticating(true);

    const res = await myApiFetch('/auth/wca/refresh', {
      method: 'POST',
    });

    if (!res.ok) {
      setAuthenticating(false);
      logout();
      throw await res.text();
    }

    const data = await res.json();

    setJWT(data.jwt);
    localStorage.setItem('jwt', data.jwt);
    setAuthenticating(false);
  }, [myApiFetch]);

  useEffect(() => {
    if (!user) {
      return;
    }

    console.log(165, user);

    if (user.exp * 1000 < Date.now()) {
      console.log('jwt expired');
      logout();
      return;
    }

    if (user?.wca.expiration < Date.now()) {
      refreshToken();
      return;
    }

    // Refresh 10 seconds before expiration
    const expiresIn = user?.wca.expiration - Date.now() - 1000 * 10;
    console.log(
      'refreshing in',
      formatDuration({
        minutes: Math.round((expiresIn / 1000 / 60) % 60),
        seconds: Math.round((expiresIn / 1000) % 60),
      })
    );
    const timeout = setTimeout(refreshToken, expiresIn);

    return () => {
      clearTimeout(timeout);
    };
  }, [user]);

  useEffect(() => {
    if (!query) {
      return;
    }

    const code = query.get('code');

    if (code) {
      setAuthenticating(true);

      const queryString = new URLSearchParams({
        code,
        redirect_uri:
          localStorage.getItem('redirectUri') || window.location.href,
      });
      navigate(location.pathname);

      myApiFetch(`/auth/wca/callback?${queryString.toString()}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to authenticate');
          }

          return res.json();
        })
        .then((data) => {
          setJWT(data.jwt);
          localStorage.setItem('jwt', data.jwt);
          setAuthenticating(false);
        });
    }
  }, [query]);

  return (
    <AuthContext.Provider
      value={{ jwt, login, logout, user, wcaApiFetch, authenticating }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
