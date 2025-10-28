import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './contexts/AppContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Impossibile trovare l'elemento radice a cui montare l'applicazione");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);