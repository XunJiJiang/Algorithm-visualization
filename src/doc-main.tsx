import ReactDOM from 'react-dom/client';
import Document from './assets/doc/document.md?raw';
import { PageTemplate } from './components/page-template/index.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(<PageTemplate markdown={Document} />);
