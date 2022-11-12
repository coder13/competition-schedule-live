import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import jwtDecode from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: number;
  name: string;
  wcaId: string;
  countryId: string;
  avatar?: {
    thumb_url?: string;
    url: string;
  };
}

interface IAuthContext {
  user: User | null;
  token: string | null;
  setToken: (a: string) => void;
}

const AuthContext = createContext<IAuthContext>({
  user: null,
  token: null,
  setToken: () => null,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<null | string>(null);
  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    if (token) {
      try {
        void SecureStore.setItemAsync('token', token);
      } catch (e) {
        console.error(e);
      }

      const decoded = jwtDecode<User>(token);
      setUser(decoded);
    }
  }, [token]);

  useEffect(() => {
    SecureStore.getItemAsync('token')
      .then((token) => {
        if (token) {
          console.log(46, token);
          setToken(token);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
