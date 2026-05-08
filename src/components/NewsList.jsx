import React, { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const NewsList = ({ news, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterCategory, setFilterCategory] = useState('All');

  if (loading && (!news || news.length === 0)) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="panel" style={{ padding: 0, height: '300px', display: 'flex', flexDirection: 'column' }}>
            <div className="skeleton" style={{ height: '150px', borderRadius: '12px 12px 0 0' }}></div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="skeleton" style={{ height: '20px', width: '40%' }}></div>
              <div className="skeleton" style={{ height: '20px', width: '100%' }}></div>
              <div className="skeleton" style={{ height: '20px', width: '80%' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!news || news.length === 0) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>NO INTEL DETECTED.</div>;
  }

  let filteredNews = news.filter(article => 
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    article.source?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '250px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search articles" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Sort by date</option>
          <option value="source">Sort by source</option>
        </select>
        <button onClick={() => setFilterCategory('All')} style={{ background: filterCategory === 'All' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>All</button>
        <button onClick={() => setFilterCategory('Science')} style={{ background: filterCategory === 'Science' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>Science</button>
        <button onClick={() => setFilterCategory('Technology')} style={{ background: filterCategory === 'Technology' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>Technology</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredNews.slice(0, 8).map((article, index) => (
          <motion.div 
            key={index} 
            className="panel" 
            style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {article.urlToImage ? (
              <img 
                src={article.urlToImage} 
                alt="thumbnail"
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{ width: '100%', height: '160px', background: 'var(--panel-border)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}></div>
            )}
            
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Technology • {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#fff', lineHeight: '1.4' }}>
                  {article.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.description || 'Open the article for the full story.'}
                </p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {article.source?.name || 'News Source'}
                </span>
                <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Read More <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
