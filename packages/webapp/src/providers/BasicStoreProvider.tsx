// basic store made with useReducer and createContext

import { ReactNode, useState, createContext } from 'react';

const StoreContext = createContext<{
  appTitle: [string, React.Dispatch<React.SetStateAction<string>>];
}>({
  appTitle: ['', () => {}],
});

const StoreProvider = ({ children }: { children: ReactNode }) => {
  const appTitle = useState('Competition Schedule Live');

  return (
    <StoreContext.Provider value={{ appTitle }}>
      {children}
    </StoreContext.Provider>
  );
};

export { StoreContext, StoreProvider };
