import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import App from './App';
import './index.css';
import AuthProvider from './providers/AuthProvider';

const theme = createTheme();

const client = new ApolloClient({
  uri: 'http://10.0.0.234:8080/graphql',
  cache: new InMemoryCache(),
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <ApolloProvider client={client}>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </ApolloProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </>
);
