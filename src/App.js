import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Creator from './pages/Creator';
import CharacterSheet from './pages/CharacterSheet';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<Dashboard />} />
        <Route path="/create" element={<Creator />} />
        <Route path="/sheet"  element={<CharacterSheet />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
