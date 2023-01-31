import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import App from './App';
import './index.css';
import AuthProvider from './providers/AuthProvider';
import { StoreProvider } from './providers/BasicStoreProvider';
import client from './apolloClient';
import { ConfirmProvider } from 'material-ui-confirm';
const theme = createTheme();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <StoreProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <ApolloProvider client={client}>
              <QueryClientProvider client={queryClient}>
                <ConfirmProvider>
                  <App />
                </ConfirmProvider>
              </QueryClientProvider>
            </ApolloProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </StoreProvider>
  </>
);
