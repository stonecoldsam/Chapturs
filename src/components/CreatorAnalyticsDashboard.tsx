'use client'

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import DataService from '@/lib/api/DataService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsResponse {
  overview: {
    totalWorks: number;
    totalChapters: number;
    totalLikes: number;
    totalBookmarks: number;
    totalSubscriptions: number;
  };
  chapterDropoff: Array<{ chapter: string; dropoff: number[] }>;
  engagementHotspots: Array<{ chapter: string; likes: number[]; bookmarks: number[]; subscriptions: number[] }>;
  adRevenue: Array<{ chapter: string; revenue: number[] }>;
  consumptionStats: {
    totalReads: number;
    avgReadTime: number;
    completionRate: number;
  };
}

const CreatorAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getCreatorAnalytics().then((res: AnalyticsResponse) => {
      setData(res);
      setLoading(false);
    }).catch((error: any) => {
      console.error('Failed to load analytics:', error);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (!data) return <div>No analytics data available.</div>;

  // Example: Drop-off chart for first chapter
  const dropoffChart = {
    labels: data.chapterDropoff[0]?.dropoff.map((_: number, i: number) => `Section ${i + 1}`),
    datasets: [
      {
        label: 'Reader Retention (%)',
        data: data.chapterDropoff[0]?.dropoff,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // Example: Engagement hotspots for first chapter
  const engagementChart = {
    labels: data.engagementHotspots[0]?.likes.map((_: number, i: number) => `Section ${i + 1}`),
    datasets: [
      {
        label: 'Likes',
        data: data.engagementHotspots[0]?.likes,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Bookmarks',
        data: data.engagementHotspots[0]?.bookmarks,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Subscriptions',
        data: data.engagementHotspots[0]?.subscriptions,
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
      },
    ],
  };

  // Example: Ad revenue chart for first chapter
  const adRevenueChart = {
    labels: data.adRevenue[0]?.revenue.map((_: number, i: number) => `Section ${i + 1}`),
    datasets: [
      {
        label: 'Ad Revenue ($)',
        data: data.adRevenue[0]?.revenue,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Content Analytics</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Works</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.overview.totalWorks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Chapters</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.overview.totalChapters}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Likes</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.overview.totalLikes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookmarks</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.overview.totalBookmarks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscriptions</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.overview.totalSubscriptions}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Reader Drop-off</h3>
          <Line data={dropoffChart} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Engagement Hotspots</h3>
          <Bar data={engagementChart} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Ad Revenue by Section</h3>
        <Bar data={adRevenueChart} />
      </div>

      {/* Consumption Stats */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Content Consumption Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Reads</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.consumptionStats.totalReads}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average Read Time</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.consumptionStats.avgReadTime} min</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(data.consumptionStats.completionRate * 100)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorAnalyticsDashboard;
