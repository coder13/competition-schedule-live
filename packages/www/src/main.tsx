import React from 'react';
import ReactDOM from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import 'bulma/css/bulma.min.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { UserProvider } from './Providers/UserProvider';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <ApolloProvider client={client}>
          <UserProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </UserProvider>
        </ApolloProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
