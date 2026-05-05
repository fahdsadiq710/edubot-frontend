'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Trash2, UserPlus, LogOut, Search, Shield,
  Loader2, AlertTriangle, Check, Eye, TrendingUp, Zap,
} from 'lucide-react';
import type { User } from '@/lib/types';

/* ── Auth gate ────────────────────────────────────────────── */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) { setError('Invalid password.'); return; }
      sessionStorage.setItem('fox_admin_token', password);
      onLogin();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center px-4">
      <div className="fixed inset-0 hero-mesh pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm glass-strong rounded-3xl p-8"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 mx-auto shadow-neon">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-display font-bold text-2xl text-center mb-1">Admin Portal</h1>
        <p className="text-white/40 text-sm text-center mb-8">Fox Micro-Learning Platform</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
          {error && (
            <p className="text-red-400 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
          <button type="submit" disabled={loading || !password} className="btn-primary flex justify-center items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-white/50 text-xs font-medium">{label}</p>
        <p className="font-display font-bold text-2xl text-white">{value}</p>
      </div>
    </div>
  );
}

/* ── Confirm modal ────────────────────────────────────────── */
function ConfirmModal({ name, onConfirm, onCancel, loading }: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="glass-strong rounded-2xl p-7 max-w-sm w-full"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-5 mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="font-display font-bold text-xl text-center mb-2">Delete user?</h3>
        <p className="text-white/50 text-sm text-center mb-7">
          This will permanently remove <strong className="text-white">{name}</strong> from the database
          and stop all bot interactions. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 glass rounded-xl py-3 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-500 rounded-xl py-3 text-sm font-medium text-white transition-colors flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Add user modal ───────────────────────────────────────── */
function AddUserModal({ token, onClose, onAdded }: {
  token: string; onClose: () => void; onAdded: () => void;
}) {
  const [form, setForm] = useState({ telegram_id: '', full_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.telegram_id || !form.full_name) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({
          telegram_id: parseInt(form.telegram_id),
          full_name: form.full_name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add user');
      setSuccess(true);
      setTimeout(() => { onAdded(); onClose(); }, 1000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="glass-strong rounded-2xl p-7 max-w-sm w-full"
      >
        <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-indigo-400" /> Add User
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Telegram ID</label>
            <input
              type="number"
              value={form.telegram_id}
              onChange={(e) => setForm({ ...form, telegram_id: e.target.value })}
              placeholder="123456789"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Ahmed Hassan"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 glass rounded-xl py-3 text-sm font-medium text-white/70 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || success} className="flex-1 btn-primary flex justify-center items-center gap-2 py-3 text-sm">
              {success ? <Check className="w-4 h-4" /> : loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add User'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [authed, setAuthed]   = useState(false);
  const [token, setToken]     = useState('');
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast]     = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('fox_admin_token');
    if (saved) { setToken(saved); setAuthed(true); }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-token': token },
      });
      if (!res.ok) { handleLogout(); return; }
      const data = await res.json();
      setUsers(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (authed) fetchUsers(); }, [authed, fetchUsers]);

  function handleLogout() {
    sessionStorage.removeItem('fox_admin_token');
    setAuthed(false);
    setToken('');
    setUsers([]);
  }

  function handleLogin() {
    const t = sessionStorage.getItem('fox_admin_token') ?? '';
    setToken(t);
    setAuthed(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ telegram_id: deleteTarget.telegram_id }),
      });
      if (!res.ok) throw new Error('Delete failed');
      setUsers((u) => u.filter((x) => x.id !== deleteTarget.id));
      showToast(`${deleteTarget.full_name} deleted.`);
    } catch {
      showToast('Failed to delete user.');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  if (!authed) return <LoginScreen onLogin={handleLogin} />;

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      String(u.telegram_id).includes(search),
  );

  const activeCount   = users.filter((u) => u.is_active).length;
  const totalSessions = users.reduce((a, u) => a + (u.total_sessions ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="fixed inset-0 hero-mesh opacity-40 pointer-events-none" />

      {/* Topbar */}
      <header className="glass border-b border-white/8 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg">Fox Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard label="Total Users"    value={users.length} icon={Users}      color="bg-indigo-500/30" />
          <StatCard label="Active Users"   value={activeCount}  icon={Eye}        color="bg-green-500/30"  />
          <StatCard label="Total Sessions" value={totalSessions} icon={TrendingUp} color="bg-purple-500/30" />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or Telegram ID…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/40 transition-all"
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-white/40 text-xs uppercase tracking-wide">
                  <th className="text-left px-6 py-4 font-medium">User</th>
                  <th className="text-left px-4 py-4 font-medium hidden md:table-cell">Goal</th>
                  <th className="text-left px-4 py-4 font-medium hidden lg:table-cell">Level</th>
                  <th className="text-center px-4 py-4 font-medium hidden lg:table-cell">Sessions</th>
                  <th className="text-center px-4 py-4 font-medium">Status</th>
                  <th className="text-right px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-white/30">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-white/30">
                      No users found.
                    </td>
                  </tr>
                )}
                <AnimatePresence>
                  {filtered.map((u) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-600/40 border border-indigo-500/30 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {u.full_name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white flex items-center gap-1.5">
                              {u.full_name}
                              {u.is_admin && (
                                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded px-1.5 py-0.5">admin</span>
                              )}
                            </p>
                            <p className="text-white/35 text-xs">ID: {u.telegram_id}</p>
                          </div>
                        </div>
                      </td>
                      {/* Goal */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-white/60 max-w-[160px] block truncate">{u.goal ?? '—'}</span>
                      </td>
                      {/* Level */}
                      <td className="px-4 py-4 hidden lg:table-cell">
                        {u.level ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.level === 'beginner'     ? 'bg-green-500/15 text-green-400'  :
                            u.level === 'intermediate' ? 'bg-yellow-500/15 text-yellow-400' :
                                                         'bg-red-500/15 text-red-400'
                          }`}>
                            {u.level}
                          </span>
                        ) : '—'}
                      </td>
                      {/* Sessions */}
                      <td className="px-4 py-4 text-center hidden lg:table-cell">
                        <span className="font-mono text-white/70">{u.total_sessions ?? 0}</span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.is_active
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                          {u.is_active ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteTarget(u)}
                          disabled={u.is_admin}
                          title={u.is_admin ? 'Cannot delete admin' : 'Delete user'}
                          className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-white/5 text-white/30 text-xs">
            {filtered.length} of {users.length} users
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            name={deleteTarget.full_name}
            loading={deleteLoading}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
        {showAdd && (
          <AddUserModal
            token={token}
            onClose={() => setShowAdd(false)}
            onAdded={fetchUsers}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 glass rounded-xl px-5 py-3 text-sm text-white flex items-center gap-2 z-50"
          >
            <Check className="w-4 h-4 text-green-400" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
