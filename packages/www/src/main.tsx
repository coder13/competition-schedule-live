import React from 'react';
import ReactDOM from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import 'bulma/css/bulma.min.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SnackbarProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SnackbarProvider>
  </React.StrictMode>
);
