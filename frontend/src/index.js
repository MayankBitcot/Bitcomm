import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { VoiceProvider } from './context/VoiceContext';
import { CartProvider } from './context/CartContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <VoiceProvider>
          <App />
        </VoiceProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
