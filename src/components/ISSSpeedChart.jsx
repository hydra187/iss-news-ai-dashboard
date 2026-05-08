import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const ISSSpeedChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="skeleton" style={{ height: '250px', width: '100%' }}></div>;
  }

  const chartData = {
    labels: data.map((d, i) => {
      const date = new Date(d.timestamp * 1000);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'ISS Speed (km/h)',
        data: data.map(d => d.speed),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4, // Smooth curve
        pointRadius: 3,
        pointBackgroundColor: '#3b82f6',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-primary)'
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: { color: 'var(--border-color)' },
        ticks: { color: 'var(--text-secondary)' },
        title: { display: true, text: 'Speed (km/h)', color: 'var(--text-secondary)' }
      },
      x: {
        grid: { color: 'var(--border-color)' },
        ticks: { color: 'var(--text-secondary)' },
      }
    }
  };

  return (
    <div style={{ height: '250px', width: '100%' }}>
      <Line options={options} data={chartData} />
    </div>
  );
};
