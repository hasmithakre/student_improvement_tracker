import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ProgressChart({
  type = 'line',
  title,
  labels = [],
  datasets = [],
  height = 200,
  showLegend = false,
  color = '#6366f1',
  emptyMessage = 'No data available yet',
  style = {}
}) {
  const hasData = labels.length > 0 && datasets.some(d => d.data?.some(v => v > 0));

  const defaultLineDataset = (ds) => ({
    borderColor: color,
    backgroundColor: color + '18',
    fill: true,
    tension: 0.4,
    pointBackgroundColor: color,
    pointRadius: 5,
    pointHoverRadius: 7,
    borderWidth: 2,
    ...ds,
  });

  const defaultBarDataset = (ds) => ({
    backgroundColor: (ds.data || []).map(() => color + 'bb'),
    borderColor: color,
    borderWidth: 2,
    borderRadius: 8,
    ...ds,
  });

  const defaultDoughnutDataset = (ds) => ({
    borderWidth: 0,
    hoverOffset: 8,
    ...ds,
  });

  const enrichedDatasets = datasets.map(ds => {
    if (type === 'line') return defaultLineDataset(ds);
    if (type === 'bar') return defaultBarDataset(ds);
    if (type === 'doughnut') return defaultDoughnutDataset(ds);
    return ds;
  });

  const chartData = { labels, datasets: enrichedDatasets };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: showLegend, position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } } },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e1b4b',
        bodyColor: '#64748b',
        borderColor: '#e0e7ff',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif" },
      }
    },
  };

  const lineBarOptions = {
    ...baseOptions,
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, color: '#94a3b8', callback: v => v + '%' } },
      x: { grid: { display: false }, ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, color: '#94a3b8' } }
    },
  };

  const doughnutOptions = {
    ...baseOptions,
    cutout: '70%',
  };

  const options = type === 'doughnut' ? doughnutOptions : lineBarOptions;

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 15px rgba(99,102,241,0.08)', ...style }}>
      {title && (
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          {title}
        </h3>
      )}

      {!hasData ? (
        <div style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#c7d2fe', gap: 8 }}>
          <span style={{ fontSize: 36 }}>📊</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{emptyMessage}</span>
        </div>
      ) : (
        <div style={{ height }}>
          {type === 'line' && <Line data={chartData} options={options} />}
          {type === 'bar' && <Bar data={chartData} options={options} />}
          {type === 'doughnut' && <Doughnut data={chartData} options={options} />}
        </div>
      )}
    </div>
  );
}

/* ── Convenience wrappers ─────────────────────────────────────── */

export function LineChart({ title, labels, data, color = '#6366f1', height = 200, style }) {
  return (
    <ProgressChart type="line" title={title} labels={labels} height={height} style={style}
      datasets={[{ label: title, data }]} color={color} />
  );
}

export function BarChart({ title, labels, data, colors, height = 200, style }) {
  const ds = {
    label: title,
    data,
    ...(colors ? { backgroundColor: colors.map(c => c + 'bb'), borderColor: colors } : {})
  };
  return (
    <ProgressChart type="bar" title={title} labels={labels} height={height} style={style}
      datasets={[ds]} color="#6366f1" />
  );
}

export function DoughnutChart({ title, labels, data, colors, height = 200, style }) {
  return (
    <ProgressChart type="doughnut" title={title} labels={labels} height={height} style={style}
      showLegend datasets={[{ data, backgroundColor: colors || ['#6366f1', '#e0e7ff'] }]} />
  );
}
