import './index.css'; // Make sure this line exists!
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Get the root element
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// Render the App inside StrictMode
root.render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
);
