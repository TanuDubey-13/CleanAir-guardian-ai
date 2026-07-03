import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, isFirebaseMock } from '../firebase/config';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import MapDashboard from '../components/MapDashboard';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import { Line, Doughnut } from 'react-chartjs-2';
import { Leaf, ArrowUpRight } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type SafeReport = {
  id: string;
  imageUrl?: string;
  address?: string;
  status?: string;
  createdAt?: any;
  aiAnalysis?: {
    category?: string;
    severity?: string;
  };
};

const Dashboard: React.FC = () => {
  const [allReports, setAllReports] = useState<SafeReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        if (isFirebaseMock) {
          const localData = localStorage.getItem('mock_reports');
          setAllReports(localData ? JSON.parse(localData) : []);
          setLoading(false);
          return;
        }

        const ref = collection(db, 'reports');
        const q = query(ref, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);

        const list: SafeReport[] = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as SafeReport));

        setAllReports(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const total = allReports.length;

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">

      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="text-green-500" />
            CleanAir Dashboard
          </h1>
          <p className="text-sm text-gray-500">Monitoring system</p>
        </div>

        <Link to="/report" className="btn-primary">
          Report Hotspot <ArrowUpRight />
        </Link>
      </div>

      <div className="h-64 bg-gray-200 rounded-xl flex items-center justify-center">
        {loading ? "Loading..." : <MapDashboard />}
      </div>

      <div className="text-lg">Total Reports: {total}</div>

      <div className="grid md:grid-cols-2 gap-6">
        <Doughnut data={{ labels: [], datasets: [{ data: [] }] }} />
        <Line data={{ labels: [], datasets: [{ data: [] }] }} />
      </div>

    </div>
  );
};

export default Dashboard;