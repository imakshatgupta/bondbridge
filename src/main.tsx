import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App';
import { ThemeProvider } from './components/ThemeProvider';
createRoot(document.getElementById('root')!).render(
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <App />
    </ThemeProvider>
);
