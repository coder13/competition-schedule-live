// Basic react provider for user data. Stores user in localstorage and fetches on startup
import { createContext, ReactNode, useContext, useState } from 'react';

const UserContext = createContext<{
  user?: User;
  setUser: (user: User) => void;
}>({
  setUser: () => {},
});

const key = 'compNotify.user';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, _setUser] = useState<User>(
    JSON.parse(localStorage.getItem(key) || '{}')
  );

  console.log(23, user);

  const setUser = (user: User) => {
    _setUser(user);
    localStorage.setItem(key, JSON.stringify(user));
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
