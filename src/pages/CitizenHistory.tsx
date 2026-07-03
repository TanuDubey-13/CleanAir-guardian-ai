import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, isFirebaseMock } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, RefreshCw, Eye, 
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck 
} from 'lucide-react';

interface ReportDoc {
  id: string;
  address: string;
  description: string;
  imageUrl: string;
  status: 'pending' | 'verified' | 'rejected' | 'resolved';
  adminNotes?: string;
  createdAt: string;
  aiAnalysis: {
    category: string;
    severity: string;
  };
}

const CitizenHistory: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportDoc | null>(null);

  const fetchReports = async (showRefresher = false) => {
    if (!user) return;
    if (showRefresher) setRefreshing(true);
    else setLoading(true);

    try {
      if (isFirebaseMock) {
        const localData = localStorage.getItem('mock_reports');
        const list = localData ? JSON.parse(localData) : [];
        const filteredList = list.filter((r: any) => r.reporterId === user.uid);
        filteredList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(filteredList);
        return;
      }

      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef,
        where('reporterId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reportsList: ReportDoc[] = [];
      
      querySnapshot.forEach((doc) => {
        reportsList.push({
          id: doc.id,
          ...doc.data()
        } as ReportDoc);
      });
      
      setReports(reportsList);
    } catch (error) {
      console.error("Error loading user reports:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const getStatusStyle = (status: ReportDoc['status']) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-250';
      case 'verified':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-250';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border-red-250';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-250';
    }
  };

  const getStatusIcon = (status: ReportDoc['status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 shrink-0" />;
      case 'verified':
        return <ShieldCheck className="w-4 h-4 shrink-0" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 shrink-0" />;
      default:
        return <AlertTriangle className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 font-sans">
      
      {/* Title Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-800 dark:text-white">Report History</h1>
          <p className="text-slate-400 text-sm mt-1">Track updates and resolutions on your submissions.</p>
        </div>
        <button
          onClick={() => fetchReports(true)}
          disabled={loading || refreshing}
          className="btn-outline py-2 px-3 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        /* Loading Skeleton Grid */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-slate-200 dark:border-dark-800 rounded-2xl p-4 bg-white dark:bg-dark-900 animate-pulse space-y-4">
              <div className="aspect-video bg-slate-200 dark:bg-dark-800 rounded-xl w-full" />
              <div className="h-4 bg-slate-200 dark:bg-dark-800 rounded w-1/3" />
              <div className="h-6 bg-slate-200 dark:bg-dark-800 rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-dark-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        /* Empty History State */
        <div className="text-center py-16 bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 p-8 shadow-soft max-w-md mx-auto">
          <div className="p-4 bg-slate-50 dark:bg-dark-950 text-slate-400 rounded-full w-fit mx-auto mb-4">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="font-display font-semibold text-lg text-slate-800 dark:text-white mb-2">No Reports Yet</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            You haven't reported any pollution hotspots yet. Submit your first cleanair request today!
          </p>
          <a href="/report" className="btn-primary py-2.5 px-5 mx-auto">
            Report Pollution
          </a>
        </div>
      ) : (
        /* Reports Grid */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl overflow-hidden shadow-soft flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video">
                  <img
                    src={report.imageUrl}
                    alt={report.aiAnalysis.category}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border tracking-wider flex items-center gap-1 shadow-sm ${getStatusStyle(report.status)}`}>
                      {getStatusIcon(report.status)}
                      <span>{report.status}</span>
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-primary-600 dark:text-primary-400">{report.aiAnalysis.category}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="font-display font-bold text-slate-800 dark:text-white text-base line-clamp-1">
                    {report.address}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {report.description || 'No user comments added.'}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 dark:border-dark-800/60 mt-3 flex items-center justify-between">
                <span className="text-slate-400 text-xs">ID: #{report.id.substring(0, 6)}</span>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 border-b border-slate-100 dark:border-dark-800/60 flex items-center justify-between">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(selectedReport.status)}`}>
                  {selectedReport.status}
                </span>
                <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white mt-1">
                  Report #{selectedReport.id.substring(0, 8)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <img
                src={selectedReport.imageUrl}
                alt="Pollution hazard report"
                className="w-full rounded-xl aspect-video object-cover border border-slate-200 dark:border-dark-800 shadow-sm"
              />

              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-1">Details & Context</h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                      {selectedReport.description || 'No user comments added.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-1">Submitted Date</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-1">Incident Location</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-xs flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{selectedReport.address}</span>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-1">Category & Severity</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      {selectedReport.aiAnalysis.category} • <strong className="text-primary-600 dark:text-primary-400 font-semibold">{selectedReport.aiAnalysis.severity} Severity</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Administrative Feedback Notes */}
              <div className="p-4 bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-800 rounded-xl">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary-500" />
                  <span>Administrative Feedback & Cleanup Notes</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mt-1">
                  {selectedReport.adminNotes || 'Verification pending. Once municipal crews check this report, feedback notes will display here.'}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-dark-800/60 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="btn-primary py-2 px-4"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CitizenHistory;
