import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
