import React from 'react';
import { Moon, Sun, Activity } from 'lucide-react';

export const Header = ({ theme, toggleTheme }) => {
  return (
    <header className="app-header">
      <div className="header-title">
        <Activity size={28} style={{ color: 'var(--accent-primary)' }} />
        <span>Orbit & Pulse</span>
      </div>
      <button className="btn btn-icon" onClick={toggleTheme} aria-label="Toggle Theme">
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
};
