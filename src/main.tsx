
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ReplyProvider } from './contexts/ReplyContext';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <AuthProvider>
    <ReplyProvider>
      <App />
    </ReplyProvider>
  </AuthProvider>
);
