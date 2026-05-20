import { useState } from 'react';
import { AlertCircle, ExternalLink, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export const NewsList = ({ news, loading, error, onRetry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterCategory, setFilterCategory] = useState('All');

  if (loading && (!news || news.length === 0)) {
    return (
      <div className="news-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="news-card news-card-loading">
            <div className="skeleton news-card-image"></div>
            <div className="news-card-body">
              <div className="skeleton skeleton-line short"></div>
              <div className="skeleton skeleton-line"></div>
              <div className="skeleton skeleton-line medium"></div>
              <div className="skeleton skeleton-line tiny"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && (!news || news.length === 0)) {
    return (
      <div className="empty-state error-state">
        <AlertCircle size={34} />
        <h4>News feed unavailable</h4>
        <p>{error}</p>
        <button onClick={onRetry}>Retry uplink</button>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="empty-state">
        <Search size={34} />
        <h4>No intel detected</h4>
        <p>The current feed is empty. Refresh or broaden your search terms.</p>
      </div>
    );
  }

  let filteredNews = news.filter(article => 
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    article.source?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterCategory !== 'All') {
    filteredNews = filteredNews.filter(article => {
      const haystack = `${article.title || ''} ${article.description || ''}`.toLowerCase();
      return haystack.includes(filterCategory.toLowerCase());
    });
  }

  filteredNews = [...filteredNews].sort((a, b) => {
    if (sortBy === 'source') {
      return (a.source?.name || '').localeCompare(b.source?.name || '');
    }
    return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
  });

  return (
    <div>
      <div className="news-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search articles" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Sort by date</option>
          <option value="source">Sort by source</option>
        </select>
        <button className={filterCategory === 'All' ? 'active-filter' : ''} onClick={() => setFilterCategory('All')}>All</button>
        <button className={filterCategory === 'Science' ? 'active-filter' : ''} onClick={() => setFilterCategory('Science')}>Science</button>
        <button className={filterCategory === 'Technology' ? 'active-filter' : ''} onClick={() => setFilterCategory('Technology')}>Technology</button>
      </div>

      {filteredNews.length === 0 ? (
        <div className="empty-state">
          <Search size={30} />
          <h4>No matching articles</h4>
          <p>Try a different term or switch the filter back to all.</p>
        </div>
      ) : (
      <div className="news-grid">
        {filteredNews.slice(0, 8).map((article, index) => (
          <motion.div 
            key={index} 
            className="news-card" 
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {article.urlToImage ? (
              <img 
                src={article.urlToImage} 
                alt="thumbnail"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="news-image-fallback"></div>
            )}
            
            <div className="news-card-body">
              <div>
                <div className="news-meta">
                  Technology • {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <h4>
                  {article.title}
                </h4>
                <p>
                  {article.description || 'Open the article for the full story.'}
                </p>
              </div>
              
              <div className="news-footer">
                <span>
                  {article.source?.name || 'News Source'}
                </span>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Read More <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
};
