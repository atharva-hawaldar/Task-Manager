import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

// =========================================
// 1. AUTH GATE (Login & Company Logic)
// =========================================
const AuthGate = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [companyName, setCompanyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        const user = authData.user;

        if (role === "admin") {
          const code = Math.random().toString(36).substring(2, 8).toUpperCase();
          const { data: co, error: coError } = await supabase.from("companies").insert([{ name: companyName, invite_code: code }]).select().single();
          if (coError) throw coError;
          await supabase.from("profiles").insert([{ id: user.id, company_id: co.id, role: "admin", email: user.email }]);
          alert(`Jungle Created! Code: ${code}`);
        } else {
          const { data: co, error: fError } = await supabase.from("companies").select("id").eq("invite_code", inviteCode).single();
          if (fError || !co) throw new Error("Invalid Invite Code!");
          await supabase.from("profiles").insert([{ id: user.id, company_id: co.id, role: "employee", email: user.email }]);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-icon">✦</div>
        <h2>{isSignUp ? "Join the Jungle" : "Welcome Back"}</h2>
        <form onSubmit={handleAuth}>
          {isSignUp && (
            <div className="role-selector">
              <button type="button" className={role === "admin" ? "active" : ""} onClick={() => setRole("admin")}>Manager</button>
              <button type="button" className={role === "employee" ? "active" : ""} onClick={() => setRole("employee")}>Staff</button>
            </div>
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {isSignUp && role === "admin" && <input type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required />}
          {isSignUp && role === "employee" && <input type="text" placeholder="Invite Code" value={inviteCode} onChange={e => setInviteCode(e.target.value)} required />}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : "Enter Jungle"}
          </button>
        </form>
        <p onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? "Already a member? Sign In" : "New here? Get Started"}</p>
      </div>
    </div>
  );
};

// =========================================
// 2. MAIN APP (Dashboard & Real-time)
// =========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("low");
  const [deadline, setDeadline] = useState("");
  const [assignee, setAssignee] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user);
      else setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user);
      else { setUser(null); setProfile(null); setLoading(false); }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (u) => {
    const { data } = await supabase.from("profiles").select("*, companies(name, invite_code)").eq("id", u.id).single();
    if (data) {
      setProfile(data);
      setUser(u);
      fetchData(data.company_id);
    }
  };

  const fetchData = async (companyId) => {
    const { data: t } = await supabase.from("tasks").select("*, profiles!tasks_assigned_to_fkey(email)").eq("company_id", companyId).order("created_at", { ascending: false });
    setTasks(t || []);
    const { data: e } = await supabase.from("profiles").select("id, email").eq("company_id", companyId).eq("role", "employee");
    setEmployees(e || []);
    setLoading(false);
  };

  // REAL-TIME LISTENER (The Secret to Instant Refresh)
  useEffect(() => {
    if (!profile) return;
    const channel = supabase.channel('jungle-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `company_id=eq.${profile.company_id}` }, () => {
        fetchData(profile.company_id);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [profile]);

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    const taskData = { text: taskText, priority, deadline: deadline || null, assigned_to: assignee || user.id, company_id: profile.company_id };
    
    if (editingId) {
      await supabase.from("tasks").update(taskData).eq("id", editingId);
      setEditingId(null);
    } else {
      await supabase.from("tasks").insert([taskData]);
    }
    setTaskText(""); setDeadline(""); setAssignee("");
  };

  const toggleTask = async (id, status) => {
    // Optimistic Update (Immediate UI response)
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !status } : t));
    await supabase.from("tasks").update({ is_completed: !status }).eq("id", id);
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this mission?")) return;
    // Optimistic Update
    setTasks(tasks.filter(t => t.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setTaskText(task.text);
    setPriority(task.priority);
    setDeadline(task.deadline || "");
    setAssignee(task.assigned_to || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="loading-screen">SYNCING JUNGLE...</div>;
  if (!user) return <AuthGate />;

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-left">
          <div className="logo-icon">✦</div>
          <div>
            <h1>{profile?.companies?.name}</h1>
            <span className="role-badge">{profile?.role.toUpperCase()} MODE</span>
          </div>
        </div>
        <div className="header-right">
          {profile?.role === "admin" && <div className="invite-info">Code: <span>{profile.companies?.invite_code}</span></div>}
          <button className="logout-btn" onClick={() => supabase.auth.signOut()}>Exit</button>
        </div>
      </header>

      {profile?.role === "admin" && (
        <form className="admin-input-panel" onSubmit={handleSubmitTask}>
          <h3>{editingId ? "✎ Edit Mission" : "✚ New Mission"}</h3>
          <div className="input-row">
            <input type="text" placeholder="Task description..." value={taskText} onChange={e => setTaskText(e.target.value)} required />
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="input-row">
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            <select value={assignee} onChange={e => setAssignee(e.target.value)}>
              <option value="">Assign to: Self</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.email}</option>)}
            </select>
            <button type="submit" className="add-btn">{editingId ? "Update" : "Assign"}</button>
            {editingId && <button type="button" className="cancel-btn" onClick={() => {setEditingId(null); setTaskText("");}}>Cancel</button>}
          </div>
        </form>
      )}

      <div className="dashboard-stats">
        <div className="stat-card"><h3>{tasks.length}</h3><p>Total</p></div>
        <div className="stat-card"><h3>{tasks.filter(t => !t.is_completed).length}</h3><p>Active</p></div>
        <div className="stat-card"><h3>{tasks.filter(t => t.is_completed).length}</h3><p>Done</p></div>
      </div>

      <div className="focus-card">
        <ul className="task-list">
          {tasks.length === 0 ? <p style={{textAlign: 'center', opacity: 0.5}}>No missions assigned.</p> : 
          tasks.map(t => (
            <li key={t.id} className={`priority-${t.priority} ${t.is_completed ? 'completed' : ''}`}>
              <div className="checkbox-wrapper">
                <input type="checkbox" checked={t.is_completed} onChange={() => toggleTask(t.id, t.is_completed)} />
              </div>
              <div className="task-info">
                <span className="task-text">{t.text}</span>
                <div className="task-meta">
                  {t.deadline && <span>📅 {t.deadline}</span>}
                  <span>👤 {t.profiles?.email || "Self"}</span>
                </div>
              </div>
              <div className="task-actions">
                {profile?.role === "admin" && <button className="edit-icon" onClick={() => startEdit(t)}>✎</button>}
                <button className="delete-btn" onClick={() => deleteTask(t.id)}>×</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}