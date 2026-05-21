import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { api } from "../api/client.js";

const LEVEL_STYLES = {
  critical: { icon: <AlertTriangle size={14} className="text-red-400" />, dot: "bg-red-500", text: "text-red-300" },
  high:     { icon: <AlertTriangle size={14} className="text-orange-400" />, dot: "bg-orange-500", text: "text-orange-300" },
  info:     { icon: <Info size={14} className="text-blue-400" />, dot: "bg-blue-500", text: "text-blue-300" },
  success:  { icon: <CheckCircle2 size={14} className="text-green-400" />, dot: "bg-green-500", text: "text-green-300" },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifs = () => api("/notifications").then(setNotifications).catch(() => setNotifications([]));
    fetchNotifs(); // Fetch immediately on mount
    const interval = setInterval(fetchNotifs, 5000); // Then poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const handleOpen = () => {
    setOpen((p) => {
      const willOpen = !p;
      if (willOpen && unread > 0) {
        // Optimistically update local state so the badge disappears immediately
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        // Mark all unread as read in the backend
        notifications.filter(n => !n.read).forEach(n => {
          api(`/notifications/${n.id}/read`, { method: "POST" }).catch(console.error);
        });
      }
      return willOpen;
    });
  };

  const onNotificationClick = (n) => {
    // If it's unread, make sure the backend knows if they clicked it directly (though handleOpen already marks them, just in case)
    if (!n.read) {
      api(`/notifications/${n.id}/read`, { method: "POST" }).catch(console.error);
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    }
    
    // Extract scan ID from message if it exists (e.g., "Scan #12 found critical issues.")
    const match = n.message.match(/Scan #(\d+)/);
    if (match && match[1]) {
      setOpen(false);
      navigate(`/dashboard/history?scanId=${match[1]}`);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        aria-label="Notifications"
      >
        <Bell size={16} className="text-slate-300" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-black flex items-center justify-center text-white animate-pulse-glow">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 glass rounded-2xl shadow-glow-blue z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <h3 className="font-bold text-sm">Notifications</h3>
            {unread > 0 && (
              <span className="text-xs text-blue-400 font-semibold">{unread} unread</span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => {
                const style = LEVEL_STYLES[n.level] || LEVEL_STYLES.info;
                return (
                  <div
                    key={n.id}
                    onClick={() => onNotificationClick(n)}
                    className={`px-4 py-3 border-b border-white/5 hover:bg-white/[0.05] cursor-pointer flex gap-3 transition-colors ${!n.read ? "bg-blue-500/[0.04]" : ""}`}
                  >
                    <div className="mt-0.5 shrink-0">{style.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${style.text}`}>{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-600 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!n.read && (
                      <div className={`w-1.5 h-1.5 rounded-full ${style.dot} mt-1.5 shrink-0`} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
