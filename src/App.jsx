import React, { useState, useEffect, useCallback } from 'react';
import { ISSMap } from './components/ISSMap';
import { ISSSpeedChart } from './components/ISSSpeedChart';
import { NewsDistributionChart } from './components/NewsDistributionChart';
import { NewsList } from './components/NewsList';
import { Chatbot } from './components/Chatbot';
import { fetchISSLocation, fetchAstronauts, fetchLocationName, fetchNews, calculateDistance } from './utils/api';
import { Satellite, Users, Activity, Globe, Zap, Moon, Sun } from 'lucide-react';
import './index.css';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [issData, setIssData] = useState({ currentPosition: null, path: [], speedHistory: [], locationName: 'Scanning...', astronauts: null });
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const updateISSData = useCallback(async () => {
    try {
      const position = await fetchISSLocation();
      setIssData(prev => {
        const newPath = [...prev.path, position].slice(-15);
        let speed = 0;
        if (prev.currentPosition) {
          const dist = calculateDistance(prev.currentPosition.lat, prev.currentPosition.lon, position.lat, position.lon);
          const timeHours = (position.timestamp - prev.currentPosition.timestamp) / 3600;
          if (timeHours > 0) speed = dist / timeHours;
        } else { speed = 28000; }
        
        const posWithSpeed = { ...position, speed };
        const newSpeedHistory = [...prev.speedHistory, { speed, timestamp: position.timestamp }].slice(-30);
        
        fetchLocationName(position.lat, position.lon).then(name => {
          setIssData(current => ({ ...current, locationName: name }));
        });

        return { ...prev, currentPosition: posWithSpeed, path: newPath, speedHistory: newSpeedHistory };
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    updateISSData();
    fetchAstronauts().then(data => setIssData(prev => ({ ...prev, astronauts: data }))).catch(console.error);
    const interval = setInterval(updateISSData, 15000);
    return () => clearInterval(interval);
  }, [updateISSData]);

  const loadNews = async (force = false) => {
    setNewsLoading(true);
    try {
      const cached = localStorage.getItem('newsData');
      const time = localStorage.getItem('newsTime');
      if (!force && cached && time && (Date.now() - parseInt(time) < 900000)) {
        setNews(JSON.parse(cached));
      } else {
        const fresh = await fetchNews('general');
        setNews(fresh);
        localStorage.setItem('newsData', JSON.stringify(fresh));
        localStorage.setItem('newsTime', Date.now().toString());
        showToast('DATABANKS UPDATED');
      }
    } catch (err) {
      showToast('FEED ERROR');
    } finally { setNewsLoading(false); }
  };

  useEffect(() => { loadNews(); }, []);

  return (
    <div className="app-wrapper">
      {/* Top Navigation / Command Header */}
      <nav className="top-nav">
        <div className="logo-container">
          <Satellite size={32} color="var(--accent-cyan)" />
          <span className="logo-text">ORBITAL COMMAND</span>
          <span className="live-indicator"><div style={{width:8, height:8, borderRadius:4, background:'#ef4444'}}></div> LIVE FEED</span>
        </div>
        <button className="btn-icon-cyber" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      <main className="dashboard-grid">
        
        {/* Left Sidebar - Telemetry */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <Zap size={20} /> Telemetry Data
            </h3>
            {issData.currentPosition ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Velocity</div>
                  <div className="text-number" style={{ fontSize: '2.5rem', color: 'var(--accent-cyan)' }}>
                    {Math.round(issData.currentPosition.speed).toLocaleString()} <span style={{fontSize: '1rem'}}>KM/H</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Coordinates</div>
                  <div className="text-number" style={{ fontSize: '1.2rem' }}>LAT: {issData.currentPosition.lat.toFixed(4)}°</div>
                  <div className="text-number" style={{ fontSize: '1.2rem' }}>LON: {issData.currentPosition.lon.toFixed(4)}°</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sector</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-purple)' }}>{issData.locationName}</div>
                </div>
              </div>
            ) : <div className="skeleton" style={{ height: '200px' }}></div>}
          </div>

          <div className="panel">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <Users size={20} /> Crew Manifest
            </h3>
            {issData.astronauts ? (
              <div>
                <div className="text-number" style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>
                  {issData.astronauts.count} <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>ACTIVE</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {issData.astronauts.people.map((p, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderLeft: '2px solid var(--accent-purple)', fontSize: '1.1rem', fontWeight: 500 }}>
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="skeleton" style={{ height: '150px' }}></div>}
          </div>
        </aside>

        {/* Center - Main Display */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="panel" style={{ padding: '0.5rem' }}>
            <ISSMap currentPosition={issData.currentPosition} path={issData.path} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="panel">
              <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}><Activity size={16} style={{display:'inline', verticalAlign:'middle'}}/> VELOCITY LOG</h4>
              <ISSSpeedChart data={issData.speedHistory} />
            </div>
            <div className="panel">
              <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}><Globe size={16} style={{display:'inline', verticalAlign:'middle'}}/> INTEL SOURCES</h4>
              <NewsDistributionChart news={news} />
            </div>
          </div>
        </section>

        {/* Right Sidebar - Intel Feed */}
        <aside className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Globe size={20} /> Global Intel
          </h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <NewsList news={news} loading={newsLoading} onRefresh={() => loadNews(true)} />
          </div>
        </aside>

      </main>

      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}

      <Chatbot dashboardData={{ iss: { ...issData.currentPosition, locationName: issData.locationName, peopleCount: issData.astronauts?.count }, news: news.slice(0,5) }} />
    </div>
  );
}

export default App;
