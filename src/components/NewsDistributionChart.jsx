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

  // Cyan and Orange matching the screenshot theme
  const colors = [
    '#2dd4bf', '#fb923c', '#818cf8', '#f472b6', '#a78bfa',
    '#34d399', '#fcd34d', '#38bdf8', '#fb7185', '#c084fc'
  ];

  const data = {
    labels,
    datasets: [
      {
        label: '# of Articles',
        data: dataValues,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 6
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
