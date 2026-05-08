import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/globals.css';
import App from './App';
import { SharedView } from './components/shared/SharedView';

const sharedToken = window.location.pathname.match(/^\/share\/(.+)$/)?.[1];

createRoot(document.getElementById('root')!).render(
  <StrictMode>{sharedToken ? <SharedView token={sharedToken} /> : <App />}</StrictMode>
);
