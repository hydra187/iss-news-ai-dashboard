import React, { useState } from 'react';
import { Search, RefreshCw, ExternalLink } from 'lucide-react';

export const NewsList = ({ news, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (loading && (!news || news.length === 0)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '80px', width: '100%' }}></div>)}
      </div>
    );
  }

  if (!news || news.length === 0) {
    return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>NO INTEL DETECTED.</div>;
  }

  let filteredNews = news.filter(article => 
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    article.source?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          placeholder="Search Feed..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn-icon-cyber" onClick={onRefresh} title="Refresh Feed">
          <RefreshCw size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
        {filteredNews.map((article, index) => (
          <div key={index} className="news-item">
            {article.urlToImage && (
              <img 
                src={article.urlToImage} 
                alt="thumbnail"
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--accent-cyan)' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#fff', letterSpacing: '0', fontFamily: 'Rajdhani', lineHeight: '1.2' }}>
                {article.title}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>{article.source?.name}</span>
                <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)' }}>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
