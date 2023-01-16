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

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SnackbarProvider>
      <ApolloProvider client={client}>
        <UserProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UserProvider>
      </ApolloProvider>
    </SnackbarProvider>
  </React.StrictMode>
);
