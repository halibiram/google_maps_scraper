import React from 'react'; // Changed from { StrictMode }
import ReactDOM from 'react-dom/client'; // Changed from { createRoot }
import App from './App.jsx'; // .jsx extension is good practice
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Your custom theme
import './index.css'; // Assuming Vite setup has this

// ReactDOM.createRoot is the new way for React 18+
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
