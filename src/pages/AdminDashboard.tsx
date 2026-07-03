import React, { useEffect, useState } from 'react';
import { db, isFirebaseMock } from '../firebase/config';
import { 
  collection, query, getDocs, doc, updateDoc, 
  deleteDoc, orderBy 
} from 'firebase/firestore';
import { 
  ShieldCheck, CheckCircle2, XCircle, Trash2, 
  Search, Loader2, RefreshCw, Users, FileText, ShieldAlert
} from 'lucide-react';

interface ReportDoc {
  id: string;
  reporterId: string;
  reporterName: string;
  address: string;
  description: string;
  imageUrl: string;
  status: 'pending' | 'verified' | 'rejected' | 'resolved';
  adminNotes?: string;
  createdAt: string;
  aiAnalysis: {
    category: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    environmentalImpact: string;
    healthRisk: string;
  };
}

interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  role: 'citizen' | 'admin';
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');
  
  // Reports States
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportDoc[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportDoc | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Admin Notes & Status Updates
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Users States
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUserUid, setUpdatingUserUid] = useState<string | null>(null);

  // Fetch Reports
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      if (isFirebaseMock) {
        const localData = localStorage.getItem('mock_reports');
        const list = localData ? JSON.parse(localData) : [];
        list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(list);
        setFilteredReports(list);
        setLoadingReports(false);
        return;
      }

      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list: ReportDoc[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as ReportDoc);
      });
      setReports(list);
      setFilteredReports(list);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      if (isFirebaseMock) {
        let localUsers = localStorage.getItem('mock_users');
        if (!localUsers) {
          const initialUsers: UserDoc[] = [
            { uid: 'mock-admin-uid-999', displayName: 'Demo Lead Admin', email: 'admin@cleanairguardian.ai', role: 'admin', createdAt: new Date().toISOString() },
            { uid: 'mock-user-456', displayName: 'Sarah Connor', email: 'sarah@resistance.org', role: 'citizen', createdAt: new Date().toISOString() },
            { uid: 'mock-user-789', displayName: 'John Doe', email: 'john@doe.com', role: 'citizen', createdAt: new Date().toISOString() }
          ];
          localStorage.setItem('mock_users', JSON.stringify(initialUsers));
          localUsers = JSON.stringify(initialUsers);
        }
        setUsers(JSON.parse(localUsers));
        setLoadingUsers(false);
        return;
      }

      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const list: UserDoc[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as UserDoc);
      });
      setUsers(list);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    } else {
      fetchUsers();
    }
  }, [activeTab]);

  // Apply filters on search & status changes
  useEffect(() => {
    let list = [...reports];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        r => r.address.toLowerCase().includes(q) || 
             r.id.toLowerCase().includes(q) || 
             r.reporterName.toLowerCase().includes(q) ||
             r.aiAnalysis.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      list = list.filter(r => r.status === statusFilter);
    }
    setFilteredReports(list);
  }, [searchQuery, statusFilter, reports]);

  // Handle Report Status Transition (Verify, Reject, Resolve)
  const handleStatusChange = async (reportId: string, newStatus: ReportDoc['status']) => {
    setActionLoading(true);
    try {
      if (isFirebaseMock) {
        const localData = localStorage.getItem('mock_reports');
        let list = localData ? JSON.parse(localData) : [];
        list = list.map((r: any) => r.id === reportId ? { 
          ...r, 
          status: newStatus, 
          adminNotes: adminNotes.trim(), 
          updatedAt: new Date().toISOString() 
        } : r);
        localStorage.setItem('mock_reports', JSON.stringify(list));
        
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus, adminNotes: adminNotes.trim() } : r));
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport(prev => prev ? { ...prev, status: newStatus, adminNotes: adminNotes.trim() } : null);
        }
        setAdminNotes('');
        setActionLoading(false);
        return;
      }

      const docRef = doc(db, 'reports', reportId);
      await updateDoc(docRef, {
        status: newStatus,
        adminNotes: adminNotes.trim(),
        updatedAt: new Date().toISOString()
      });
      
      // Update local states
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus, adminNotes } : r));
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(prev => prev ? { ...prev, status: newStatus, adminNotes } : null);
      }
      setAdminNotes('');
    } catch (err) {
      console.error("Failed to update report status:", err);
      alert("Error writing rule update permissions. Check security rules.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Report
  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this report?")) return;
    setActionLoading(true);
    try {
      if (isFirebaseMock) {
        const localData = localStorage.getItem('mock_reports');
        let list = localData ? JSON.parse(localData) : [];
        list = list.filter((r: any) => r.id !== reportId);
        localStorage.setItem('mock_reports', JSON.stringify(list));
        
        setReports(prev => prev.filter(r => r.id !== reportId));
        setSelectedReport(null);
        setActionLoading(false);
        return;
      }

      await deleteDoc(doc(db, 'reports', reportId));
      setReports(prev => prev.filter(r => r.id !== reportId));
      setSelectedReport(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete report.");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle User Role (citizen <-> admin)
  const handleToggleRole = async (userId: string, currentRole: UserDoc['role']) => {
    const nextRole: UserDoc['role'] = currentRole === 'admin' ? 'citizen' : 'admin';
    if (!window.confirm(`Change this user's role to ${nextRole}?`)) return;

    setUpdatingUserUid(userId);
    try {
      if (isFirebaseMock) {
        const localUsers = localStorage.getItem('mock_users');
        let list = localUsers ? JSON.parse(localUsers) : [];
        list = list.map((u: any) => u.uid === userId ? { ...u, role: nextRole } : u);
        localStorage.setItem('mock_users', JSON.stringify(list));
        
        setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: nextRole } : u));
        setUpdatingUserUid(null);
        return;
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: nextRole });
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: nextRole } : u));
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to modify user credentials. Admin permissions are locked down.");
    } finally {
      setUpdatingUserUid(null);
    }
  };

  const getStatusStyle = (status: ReportDoc['status']) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-250';
      case 'verified': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-250';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border-red-250';
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-250';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 font-sans space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-dark-800 pb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <span>Admin Center</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review community incident entries and moderate user access roles.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-100 dark:bg-dark-950 rounded-xl p-1 border border-slate-200 dark:border-dark-800 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold transition ${
              activeTab === 'reports' 
                ? 'bg-white dark:bg-dark-900 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Incidents</span>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold transition ${
              activeTab === 'users' 
                ? 'bg-white dark:bg-dark-900 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Roles</span>
          </button>
        </div>
      </div>

      {activeTab === 'reports' ? (
        /* REPORTS TAB */
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Report Filter & Listing */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by category, address, or reporter..."
                  className="input-field pl-10 py-2 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field py-2 px-3 text-xs w-full sm:w-40 border-slate-200 dark:border-dark-800"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                onClick={fetchReports}
                disabled={loadingReports}
                className="btn-outline py-2 px-3 justify-center"
              >
                <RefreshCw className={`w-4 h-4 ${loadingReports ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingReports ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
                <p className="text-slate-400 text-xs">Fetching community reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl p-6">
                <p className="text-slate-400 text-sm font-semibold">No incident matches found.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {filteredReports.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedReport(r);
                      setAdminNotes(r.adminNotes || '');
                    }}
                    className={`p-4 bg-white dark:bg-dark-900 border rounded-2xl shadow-soft cursor-pointer transition flex items-center justify-between gap-4 ${
                      selectedReport?.id === r.id 
                        ? 'border-primary-500 ring-2 ring-primary-500/10' 
                        : 'border-slate-200 dark:border-dark-800 hover:border-slate-350 dark:hover:border-dark-700'
                    }`}
                  >
                    <div className="flex gap-3 overflow-hidden">
                      <img
                        src={r.imageUrl}
                        alt="report thumbnail"
                        className="w-14 h-14 object-cover rounded-xl shrink-0 border border-slate-100 dark:border-dark-800"
                      />
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate">
                            {r.aiAnalysis.category}
                          </span>
                          <span className="text-[10px] text-slate-400">• By {r.reporterName}</span>
                        </div>
                        <p className="text-slate-400 text-xs truncate">{r.address}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          r.aiAnalysis.severity === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                          r.aiAnalysis.severity === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                        }`}>
                          {r.aiAnalysis.severity} Severity
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase shrink-0 ${getStatusStyle(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Incident Moderation Detail View */}
          <div className="lg:col-span-5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-6 rounded-2xl shadow-soft">
            {selectedReport ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-slate-800 dark:text-white text-lg">Incident Details</h3>
                  <p className="text-slate-400 text-xs">Report ID: #{selectedReport.id.substring(0, 10)}</p>
                </div>

                <img
                  src={selectedReport.imageUrl}
                  alt="Incident full preview"
                  className="w-full aspect-video object-cover rounded-xl border border-slate-200 dark:border-dark-800"
                />

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-wider">Address</h5>
                    <p className="text-slate-700 dark:text-slate-200">{selectedReport.address}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-wider">Reporter Comment</h5>
                    <p className="text-slate-600 dark:text-slate-350">{selectedReport.description || 'No user comments.'}</p>
                  </div>
                </div>

                {/* Gemini AI Summary Callout */}
                <div className="bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 p-4 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                    <span>Gemini AI Audit Overview</span>
                  </div>
                  <p className="text-slate-650 dark:text-slate-300">
                    <strong>Environmental Damage:</strong> {selectedReport.aiAnalysis.environmentalImpact}
                  </p>
                  <p className="text-slate-650 dark:text-slate-300">
                    <strong>Community Risk:</strong> {selectedReport.aiAnalysis.healthRisk}
                  </p>
                </div>

                {/* Verification Panel controls */}
                <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-dark-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Administrator Audit Notes / Comments
                    </label>
                    <textarea
                      rows={3}
                      className="input-field text-xs"
                      placeholder="Add resolution details, crew dispatch notifications, or rejection reason here..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleStatusChange(selectedReport.id, 'verified')}
                      disabled={actionLoading}
                      className="btn-outline border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 py-2 px-3 text-xs flex items-center gap-1.5 grow"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Report</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(selectedReport.id, 'resolved')}
                      disabled={actionLoading}
                      className="btn bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 text-xs flex items-center gap-1.5 grow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Resolved</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(selectedReport.id, 'rejected')}
                      disabled={actionLoading}
                      className="btn bg-red-650 hover:bg-red-700 text-white py-2 px-3 text-xs flex items-center gap-1.5 grow"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject/Spam</span>
                    </button>

                    <button
                      onClick={() => handleDeleteReport(selectedReport.id)}
                      disabled={actionLoading}
                      className="btn-outline border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 py-2 px-3.5 text-xs flex items-center justify-center"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-3">
                <FileText className="w-12 h-12 text-slate-300" />
                <p className="text-xs">Select an incident from the left feed list to verify or resolve.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* USERS TAB */
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-soft overflow-hidden">
          
          <div className="p-5 border-b border-slate-100 dark:border-dark-800/60 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-800 dark:text-white text-base">User Directory</h3>
            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>Refresh Directory</span>
            </button>
          </div>

          {loadingUsers ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
              <p className="text-slate-400 text-xs">Loading user credentials...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dark-950 border-b border-slate-200 dark:border-dark-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-4">Display Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Account Scope</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800/60">
                  {users.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-dark-950/20 text-slate-700 dark:text-slate-350">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">{u.displayName}</td>
                      <td className="p-4 font-mono">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                          u.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' 
                            : 'bg-slate-100 text-slate-700 dark:bg-dark-800 dark:text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleRole(u.uid, u.role)}
                          disabled={updatingUserUid === u.uid}
                          className="btn-outline py-1 px-3 text-[10px] font-bold mx-auto border-purple-300 dark:border-purple-800/65 text-purple-650 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 flex items-center gap-1"
                        >
                          {updatingUserUid === u.uid ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          )}
                          <span>Toggle {u.role === 'admin' ? 'Citizen' : 'Admin'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
