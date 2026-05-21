import { useState, useEffect } from "react";
import { api, getUser } from "../api/client.js";
import { Shield, User, Loader2, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { Navigate, Link } from "react-router-dom";

export default function UserManagement() {
  const currentUser = getUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // Check if current user is admin, if not, redirect to dashboard or show unauthorized
  if (currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api("/users");
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionMessage("");
      setError("");
      
      // Call the new PUT endpoint
      await api(`/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole })
      });
      
      // Update local state to reflect change without re-fetching
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setActionMessage(`Role successfully updated to ${newRole}`);
      
      // Hide success message after 3 seconds
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update role");
      setTimeout(() => setError(""), 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="text-blue-500" size={24} />
            User Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage system access and assign roles to BugShield members.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <User size={14} />
          {users.length} Total Users
        </div>
      </div>

      {/* Action Messages */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-fade-in flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
      {actionMessage && (
        <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-300 animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} />
          {actionMessage}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#0d1424] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/[0.02] border-b border-white/10 text-xs uppercase tracking-wider font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-blue-500" size={24} />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/50 to-purple-600/50 flex items-center justify-center text-xs font-black text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                      {user.id === currentUser.id && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-bold uppercase ml-2">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{user.email}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.id === currentUser.id}
                        className={`appearance-none bg-[#0a0f1c] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer transition-colors hover:border-blue-500/50 focus:border-blue-500/50
                          ${user.role === 'admin' ? 'text-purple-400' : ''}
                          ${user.role === 'developer' ? 'text-blue-400' : ''}
                          ${user.role === 'viewer' ? 'text-green-400' : ''}
                          ${user.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <option value="admin">Admin</option>
                        <option value="developer">Developer</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/dashboard/users/${user.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-colors"
                      >
                        <Activity size={14} />
                        Activity
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
