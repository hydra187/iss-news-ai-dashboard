import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const NewsDistributionChart = ({ news }) => {
  if (!news || news.length === 0) {
    return <div className="skeleton" style={{ height: '250px', width: '100%' }}></div>;
  }

  // Count by source since we're using general category and NewsAPI only provides source name
  const sourceCount = news.reduce((acc, article) => {
    const sourceName = article.source?.name || 'Unknown';
    acc[sourceName] = (acc[sourceName] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(sourceCount);
  const dataValues = Object.values(sourceCount);

  // Generate some nice colors based on accents
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b',
    '#10b981', '#06b6d4', '#6366f1', '#a855f7', '#d946ef'
  ];

  const data = {
    labels,
    datasets: [
      {
        label: '# of Articles',
        data: dataValues,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: 'var(--bg-secondary)',
        borderWidth: 2,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'var(--text-primary)'
        }
      }
    }
  };

  return (
    <div style={{ height: '250px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};
