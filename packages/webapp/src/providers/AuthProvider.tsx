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

  console.log(54, user?.wca);

  const login = useCallback(() => {
    const redirectUri = window.location.href;
    localStorage.setItem('redirectUri', redirectUri);
    const query = new URLSearchParams({
      redirect_uri: redirectUri,
    });
    window.location.href = new URL(
      `/auth/wca?${query.toString()}`,
      API_URL
    ).href;
  }, [location]);

  const myApiFetch = useCallback(
    (url: RequestInfo, { headers = {}, ...options } = {} as RequestInit) =>
      fetch(new URL(url.toString(), API_URL).href, {
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

  const wcaApiFetch = useCallback(
    async (
      url: RequestInfo,
      { headers = {}, ...options } = {} as RequestInit
    ) => {
      const res = await fetch(
        new URL(url.toString(), import.meta.env.VITE_WCA_API_ORIGIN).href,
        {
          ...(user?.wca.accessToken && {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user?.wca.accessToken}`,
              ...headers,
            },
          }),
          ...options,
        }
      );

      if (!res.ok) {
        console.error(await res.json());
        return;
      }

      return res.json();
    },
    []
  );

  const logout = useCallback(() => {
    setJWT(undefined);
    localStorage.removeItem('jwt');
  }, []);

  const refreshToken = useCallback(async () => {
    if (!user) {
      return;
    }

    console.log('refreshing', user?.wca.exp - 1000 * 10);
    setAuthenticating(true);

    const res = await myApiFetch('/auth/wca/refresh', {
      method: 'POST',
    });

    if (!res.ok) {
      setAuthenticating(false);
      throw await res.text();
    }

    setJWT((await res.json()).jwt);
    setAuthenticating(false);
  }, [myApiFetch]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user?.wca.exp < Date.now()) {
      console.log(62, 'token expired');
      refreshToken();
      return;
    }

    const expiresIn = user?.wca.exp - Date.now() - 1000 * 10;
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
          console.log('Data', data);
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
