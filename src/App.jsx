import { useState, useEffect, useCallback, useMemo } from 'react';
import { ISSMap } from './components/ISSMap';
import { ISSSpeedChart } from './components/ISSSpeedChart';
import { NewsDistributionChart } from './components/NewsDistributionChart';
import { NewsList } from './components/NewsList';
import { Chatbot } from './components/Chatbot';
import { fetchISSLocation, fetchAstronauts, fetchLocationName, fetchNews, calculateDistance } from './utils/api';
import { Navigation, MapPin, Activity, Users, Sun, Moon, RefreshCw, Newspaper, Sparkles, Satellite, Clock, AlertTriangle } from 'lucide-react';
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
  const [newsError, setNewsError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [issError, setIssError] = useState('');

  const updateISSData = useCallback(async () => {
    try {
      const position = await fetchISSLocation();
      setIssError('');
      setLastUpdated(new Date());
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
      setIssError('ISS telemetry is temporarily unavailable.');
    }
  }, []);

  useEffect(() => {
    const initialTelemetry = setTimeout(updateISSData, 0);
    fetchAstronauts().then(data => setIssData(prev => ({ ...prev, astronauts: data }))).catch(console.error);
    const interval = setInterval(updateISSData, 15000);
    return () => {
      clearTimeout(initialTelemetry);
      clearInterval(interval);
    };
  }, [updateISSData]);

  const loadNews = useCallback(async (force = false) => {
    if (force) setIsRefreshing(true);
    setNewsLoading(true);
    setNewsError('');
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
        setLastUpdated(new Date(parseInt(time)));
      } else {
        const fresh = await fetchNews('general', force);
        setNews(fresh);
        const updatedAt = Date.now();
        localStorage.setItem('newsData', JSON.stringify(fresh));
        localStorage.setItem('newsTime', updatedAt.toString());
        setLastUpdated(new Date(updatedAt));
      }
    } catch (err) {
      console.error(err);
      setNewsError('News uplink failed. Try refreshing the feed.');
    } finally {
      setNewsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialNews = setTimeout(loadNews, 0);
    return () => clearTimeout(initialNews);
  }, [loadNews]);

  const aiSummary = useMemo(() => {
    if (newsLoading) return 'Analyzing the latest signal...';
    if (newsError) return 'AI summary paused until the news feed reconnects.';
    if (!news.length) return 'No articles are available for summarization yet.';

    const sources = [...new Set(news.map(article => article.source?.name).filter(Boolean))].slice(0, 3);
    const lead = news[0]?.title?.replace(/\s+-\s+[^-]+$/, '') || 'Latest coverage is available';
    return `${lead}${sources.length ? ` Sources include ${sources.join(', ')}.` : ''}`;
  }, [news, newsError, newsLoading]);

  const lastUpdatedText = lastUpdated
    ? lastUpdated.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Awaiting first sync';

  const missionCards = [
    {
      label: 'ISS current location',
      value: issData.currentPosition
        ? `${issData.currentPosition.lat.toFixed(2)}, ${issData.currentPosition.lon.toFixed(2)}`
        : 'Acquiring',
      meta: issData.locationName,
      icon: Satellite,
      loading: !issData.currentPosition,
    },
    {
      label: 'Current speed',
      value: issData.currentPosition
        ? `${Math.round(issData.currentPosition.speed).toLocaleString()} km/h`
        : 'Calculating',
      meta: 'Live orbital estimate',
      icon: Activity,
      loading: !issData.currentPosition,
    },
    {
      label: 'Astronauts in space',
      value: issData.astronauts ? issData.astronauts.count : 'Loading',
      meta: issData.astronauts ? `${issData.astronauts.people.slice(0, 2).map(p => p.name).join(', ')}${issData.astronauts.people.length > 2 ? ' +' : ''}` : 'Manifest sync',
      icon: Users,
      loading: !issData.astronauts,
    },
    {
      label: 'News count',
      value: newsLoading ? 'Loading' : news.length,
      meta: newsError || 'Articles in current feed',
      icon: Newspaper,
      loading: newsLoading && !news.length,
      warning: Boolean(newsError),
    },
    {
      label: 'AI summary',
      value: 'Briefing',
      meta: aiSummary,
      icon: Sparkles,
      wide: true,
      loading: newsLoading && !news.length,
      warning: Boolean(newsError),
    },
  ];

  return (
    <div className="app-wrapper" data-theme={theme}>
      <nav className="top-nav">
        <div className="brand-lockup">
          <div className="subtitle"><span className="live-dot"></span> LIVE ORBITAL DASHBOARD</div>
          <h1>Orbital Intelligence Dashboard</h1>
          <div className="last-updated"><Clock size={15} /> Last updated: {lastUpdatedText}</div>
        </div>
        <div className="nav-actions">
          <button
            onClick={() => loadNews(true)}
            disabled={isRefreshing}
            title="Refresh News"
            className="nav-button"
          >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            className="nav-button"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        {(issError || newsError) && (
          <div className="status-banner" role="status">
            <AlertTriangle size={18} />
            <span>{issError || newsError}</span>
          </div>
        )}

        <section className="mission-control" aria-label="Mission Control Dashboard">
          <div className="section-heading">
            <div>
              <div className="eyebrow">MISSION CONTROL</div>
              <h2>Live operations snapshot</h2>
            </div>
            <span className="orbit-badge">ISS telemetry active</span>
          </div>
          <div className="mission-grid">
            {missionCards.map(card => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  className={`mission-card ${card.wide ? 'mission-card-wide' : ''} ${card.warning ? 'mission-card-warning' : ''}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="mission-icon"><Icon size={20} /></div>
                  <div className="mission-content">
                    <div className="mission-label">{card.label}</div>
                    {card.loading ? (
                      <div className="skeleton mission-skeleton"></div>
                    ) : (
                      <div className="mission-value">{card.value}</div>
                    )}
                    <div className="mission-meta">{card.meta}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
        
        {/* Top Section: Map & Stats */}
        <div className="primary-grid">
          <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="panel-heading">
              <div>
                <div className="eyebrow">ISS MAP</div>
                <h3>Live position and trajectory</h3>
              </div>
            </div>
            <ISSMap currentPosition={issData.currentPosition} path={issData.path} />
          </motion.div>

          <div className="stat-stack">
            <motion.div className="panel stat-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="stat-icon">
                <Navigation size={20} />
              </div>
              <div>
                <div className="stat-label">COORDINATES</div>
                {issData.currentPosition ? (
                  <div className="text-number stat-value">{issData.currentPosition.lat.toFixed(3)}, {issData.currentPosition.lon.toFixed(3)}</div>
                ) : <div className="skeleton" style={{ width: '120px', height: '20px' }}></div>}
                <div className="stat-meta">Open Notify API</div>
              </div>
            </motion.div>

            <motion.div className="panel stat-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="stat-icon">
                <MapPin size={20} />
              </div>
              <div>
                <div className="stat-label">NEAREST PLACE</div>
                <div className="stat-value">{issData.locationName}</div>
                <div className="stat-meta">{issData.path.length} positions tracked</div>
              </div>
            </motion.div>

            <motion.div className="panel stat-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <div className="stat-icon">
                <Activity size={20} />
              </div>
              <div>
                <div className="stat-label">ISS SPEED</div>
                {issData.currentPosition ? (
                  <div className="text-number stat-value">{Math.round(issData.currentPosition.speed).toLocaleString()} km/h</div>
                ) : <div className="skeleton" style={{ width: '100px', height: '20px' }}></div>}
                <div className="stat-meta">Calculated with Haversine distance</div>
              </div>
            </motion.div>

            <motion.div className="panel stat-card crew-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <div>
                <div className="stat-label">CREW</div>
                {issData.astronauts ? (
                  <div className="stat-value">{issData.astronauts.count} people in space</div>
                ) : <div className="skeleton" style={{ width: '140px', height: '20px', marginBottom: '4px' }}></div>}
                <div className="crew-manifest">
                  {issData.astronauts ? issData.astronauts.people.map(p => p.name).join(', ') : 'Loading manifest...'}
                </div>
              </div>
              <Users size={24} color="var(--text-muted)" />
            </motion.div>
          </div>
        </div>

        {/* Middle Section: Charts */}
        <div className="charts-grid">
          <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <div className="panel-heading">
              <div className="eyebrow">SPEED CHART</div>
              <h3>Last 30 measurements</h3>
            </div>
            <ISSSpeedChart data={issData.speedHistory} />
          </motion.div>
          <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
            <div className="panel-heading">
              <div className="eyebrow">NEWS DISTRIBUTION</div>
              <h3>Articles per source</h3>
            </div>
            <NewsDistributionChart news={news} />
          </motion.div>
        </div>

        {/* Bottom Section: News */}
        <motion.div className="panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
          <div className="panel-heading panel-heading-row">
            <div>
              <div className="eyebrow">LATEST NEWS</div>
              <h3>{newsLoading ? 'Fetching current articles' : `${news.length} current articles`}</h3>
            </div>
            <div className="last-updated compact"><Clock size={14} /> {lastUpdatedText}</div>
          </div>
          <NewsList news={news} loading={newsLoading} error={newsError} onRetry={() => loadNews(true)} />
        </motion.div>

      </main>

      <Chatbot dashboardData={{ iss: { ...issData.currentPosition, locationName: issData.locationName, peopleCount: issData.astronauts?.count }, news: news.slice(0,5) }} />
    </div>
  );
}

export default App;
