import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = document.getElementById('free-members-cloud-app');

if (root) {
  document.body.classList.add('fm-solo-admin-page', 'fm-solo-admin-app-ready');
  root.id = 'freemembers-solo-admin-app';

  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
