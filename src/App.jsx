import React, { useState, useEffect, useCallback } from 'react';
import { ISSMap } from './components/ISSMap';
import { ISSSpeedChart } from './components/ISSSpeedChart';
import { NewsDistributionChart } from './components/NewsDistributionChart';
import { NewsList } from './components/NewsList';
import { Chatbot } from './components/Chatbot';
import { fetchISSLocation, fetchAstronauts, fetchLocationName, fetchNews, calculateDistance } from './utils/api';
import { Navigation, MapPin, Activity, Users, Sun, Moon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import './index.css';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const [issData, setIssData] = useState({ currentPosition: null, path: [], speedHistory: [], locationName: 'Scanning...', astronauts: null });
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        } else { speed = 25000; }
        
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
    if (force) setIsRefreshing(true);
    setNewsLoading(true);
    try {
      if (force) {
        // Clear localStorage cache so Vercel CDN bypass works
        localStorage.removeItem('newsData');
        localStorage.removeItem('newsTime');
      }
      const cached = localStorage.getItem('newsData');
      const time = localStorage.getItem('newsTime');
      if (!force && cached && time && (Date.now() - parseInt(time) < 900000)) {
        setNews(JSON.parse(cached));
      } else {
        const fresh = await fetchNews('general', force);
        setNews(fresh);
        localStorage.setItem('newsData', JSON.stringify(fresh));
        localStorage.setItem('newsTime', Date.now().toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNewsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { loadNews(); }, []);

  return (
    <div className="app-wrapper" data-theme={theme}>
      <nav className="top-nav">
        <div>
          <div className="subtitle"><span className="live-dot"></span> LIVE ORBITAL DASHBOARD</div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--accent-cyan)' }}>Orbital Intelligence Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => loadNews(true)}
            disabled={isRefreshing}
            title="Refresh News"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'var(--accent-cyan)', padding: '0.6rem 1rem', borderRadius: '8px', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.85rem', cursor: isRefreshing ? 'not-allowed' : 'pointer', opacity: isRefreshing ? 0.7 : 1, transition: 'all 0.2s' }}
          >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'var(--accent-cyan)', padding: '0.6rem 1rem', borderRadius: '8px', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.85rem', cursor:'pointer' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </nav>

      <main style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Top Section: Map & Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
          <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '1px' }}>ISS MAP</div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Live position and trajectory</h3>
              </div>
            </div>
            <ISSMap currentPosition={issData.currentPosition} path={issData.path} />
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <motion.div className="panel" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--accent-cyan)' }}>
                <Navigation size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>COORDINATES</div>
                {issData.currentPosition ? (
                  <div className="text-number" style={{ fontSize: '1.2rem' }}>{issData.currentPosition.lat.toFixed(3)}, {issData.currentPosition.lon.toFixed(3)}</div>
                ) : <div className="skeleton" style={{ width: '120px', height: '20px' }}></div>}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open Notify API</div>
              </div>
            </motion.div>

            <motion.div className="panel" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--accent-cyan)' }}>
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>NEAREST PLACE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{issData.locationName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{issData.path.length} positions tracked</div>
              </div>
            </motion.div>

            <motion.div className="panel" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--accent-cyan)' }}>
                <Activity size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>ISS SPEED</div>
                {issData.currentPosition ? (
                  <div className="text-number" style={{ fontSize: '1.2rem' }}>{Math.round(issData.currentPosition.speed).toLocaleString()} km/h</div>
                ) : <div className="skeleton" style={{ width: '100px', height: '20px' }}></div>}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calculated with Haversine distance</div>
              </div>
            </motion.div>

            <motion.div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>CREW</div>
                {issData.astronauts ? (
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{issData.astronauts.count} people in space</div>
                ) : <div className="skeleton" style={{ width: '140px', height: '20px', marginBottom: '4px' }}></div>}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(45, 212, 191, 0.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                  {issData.astronauts ? issData.astronauts.people.map(p => p.name).join(', ') : 'Loading manifest...'}
                </div>
              </div>
              <Users size={24} color="var(--text-muted)" />
            </motion.div>
          </div>
        </div>

        {/* Middle Section: Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '1px' }}>SPEED CHART</div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Last 30 measurements</h3>
            </div>
            <ISSSpeedChart data={issData.speedHistory} />
          </motion.div>
          <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '1px' }}>NEWS DISTRIBUTION</div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Articles per category</h3>
            </div>
            <NewsDistributionChart news={news} />
          </motion.div>
        </div>

        {/* Bottom Section: News */}
        <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '1px' }}>LATEST NEWS</div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>10 current articles</h3>
            </div>
          </div>
          <NewsList news={news} loading={newsLoading} />
        </motion.div>

      </main>

      <Chatbot dashboardData={{ iss: { ...issData.currentPosition, locationName: issData.locationName, peopleCount: issData.astronauts?.count }, news: news.slice(0,5) }} />
    </div>
  );
}

export default App;
