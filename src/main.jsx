import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster theme="dark" position="top-right" />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
