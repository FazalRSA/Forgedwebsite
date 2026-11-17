import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { startAnalytics } from './utils/analytics';

createRoot(document.getElementById('root')!).render(<App />);

// Visit statistics: loads nothing unless config/site.ts has them set up (see src/utils/analytics.ts).
startAnalytics();
