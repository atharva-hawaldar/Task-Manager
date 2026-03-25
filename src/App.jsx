import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import OrgHub from "./components/OrgHub";
import TaskDashboard from "./components/TaskDashboard";
import "./App.css";

const AuthGate = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
        if (error) throw error;
        if (data?.user && !data?.session) alert("Check email for verification!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
      }
    } catch (err) { alert(err.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-fade">
        <div className="logo-icon"></div>
        <h2>{isSignUp ? "Create Account" : "Sign In"}</h2>
        <form onSubmit={handleAuth}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="add-btn" disabled={loading}>{loading ? "..." : isSignUp ? "Sign Up" : "Sign In"}</button>
        </form>
        <p onClick={() => setIsSignUp(!isSignUp)} className="toggle-auth" style={{cursor: 'pointer', marginTop: '10px', color: '#4ade80'}}>
          {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
        </p>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWS, setActiveWS] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [taskText, setTaskText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("free");
  const [assignee, setAssignee] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchWorkspaces(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchWorkspaces(session.user.id);
      else { setWorkspaces([]); setActiveWS(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchWorkspaces = async (userId) => {
    const { data } = await supabase.from("memberships").select("role, is_approved, companies(*)").eq("user_id", userId);
    setWorkspaces(data || []);
  };

  const fetchWorkspaceData = async () => {
    if (!activeWS?.is_approved) return;
    const coId = activeWS.companies.id;
    
    let query = supabase.from("tasks").select(`*, profiles:assigned_to(email)`).eq("company_id", coId);
    if (activeWS.role !== 'admin') query = query.eq("assigned_to", user.id);
    const { data: t } = await query.order("created_at", { ascending: false });
    setTasks(t || []);
    
    const { data: memberRows } = await supabase.from("memberships").select("user_id").eq("company_id", coId).eq("is_approved", true);
    if (memberRows?.length > 0) {
      const { data: profileRows } = await supabase.from("profiles").select("id, email").in("id", memberRows.map(m => m.user_id));
      if (profileRows) setTeam(profileRows.map(p => ({ user_id: p.id, profiles: { email: p.email } })));
    }
  };

  useEffect(() => { fetchWorkspaceData(); }, [activeWS]);

  const createOrg = async () => {
    if (!newOrgName) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: co, error: coErr } = await supabase.from("companies").insert([{ name: newOrgName, invite_code: code }]).select().single();
    if (!coErr) {
      await supabase.from("memberships").insert([{ user_id: user.id, company_id: co.id, role: 'admin', is_approved: true }]);
      setNewOrgName(""); fetchWorkspaces(user.id);
    }
  };

  const joinOrg = async () => {
    if (!inviteCodeInput) return;
    const { data: co } = await supabase.from("companies").select("id").eq("invite_code", inviteCodeInput.toUpperCase()).single();
    if (co) {
      const { error } = await supabase.from("memberships").insert([{ user_id: user.id, company_id: co.id, role: 'member', is_approved: false }]);
      if (!error) { setInviteCodeInput(""); fetchWorkspaces(user.id); alert("Request sent!"); }
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("tasks").insert([{
      text: taskText, deadline, priority, assigned_to: assignee || user.id, company_id: activeWS.companies.id, is_completed: false
    }]);
    if (!error) { setTaskText(""); setDeadline(""); setPriority("free"); fetchWorkspaceData(); }
  };

  const updateTask = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("tasks").update({
      text: editingTask.text, deadline: editingTask.deadline, priority: editingTask.priority, assigned_to: editingTask.assigned_to
    }).eq("id", editingTask.id);
    if (!error) { setEditingTask(null); fetchWorkspaceData(); }
  };

  const toggleComplete = async (id, status) => {
    await supabase.from("tasks").update({ is_completed: !status }).eq("id", id);
    fetchWorkspaceData();
  };

  const deleteTask = async (id) => {
    if (window.confirm("Delete task?")) {
      await supabase.from("tasks").delete().eq("id", id);
      fetchWorkspaceData();
    }
  }

  if (loading) return <div className="loading-screen">◈ SYNCING...</div>;
  if (!user) return <AuthGate />;

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-left">
          <div className="logo-icon">◈</div>
          <select 
            value={activeWS?.companies?.id || "switch"} 
            onChange={(e) => {
              if (e.target.value === "switch") setActiveWS(null);
              else setActiveWS(workspaces.find(w => w.companies.id === e.target.value));
            }}
          >
            <option value="switch">🏠 Switch / New Org</option>
            {workspaces.map(w => (
              <option key={w.companies.id} value={w.companies.id}>
                🏢 {w.companies.name} {w.is_approved ? "" : "(Pending)"}
              </option>
            ))}
          </select>
        </div>
        <button className="logout-btn" onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </header>

      {!activeWS ? (
        <OrgHub 
          newOrgName={newOrgName} setNewOrgName={setNewOrgName}
          inviteCodeInput={inviteCodeInput} setInviteCodeInput={setInviteCodeInput}
          onCreate={createOrg} onJoin={joinOrg}
        />
      ) : activeWS.is_approved ? (
        <TaskDashboard 
          activeWS={activeWS} tasks={tasks} team={team} user={user}
          taskText={taskText} setTaskText={setTaskText} deadline={deadline}
          setDeadline={setDeadline} priority={priority} setPriority={setPriority}
          assignee={assignee} setAssignee={setAssignee} onAddTask={addTask}
          editingTask={editingTask} setEditingTask={setEditingTask}
          onToggleComplete={toggleComplete} onUpdateTask={updateTask} onDeleteTask={deleteTask}
        />
      ) : (
        <div className="no-workspace-wrapper animate-fade">
          <div className="focus-card">
            <h2>Waiting for Approval</h2>
            <p>Your request to join <strong>{activeWS.companies.name}</strong> is pending review.</p>
            <button className="del-btn" onClick={() => setActiveWS(null)} style={{marginTop: '15px'}}>Back to Hub</button>
          </div>
        </div>
      )}
    </div>
  );
}