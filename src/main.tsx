
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ReplyProvider } from './contexts/ReplyContext';

const container = document.getElementById("root")!
const root = createRoot(container)

root.render(<ReplyProvider><App /></ReplyProvider>);
