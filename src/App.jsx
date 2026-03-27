import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";
import OrgHub from "./components/OrgHub";
import TaskDashboard from "./components/TaskDashboard";
import Auth from "./components/Auth";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWS, setActiveWS] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const isMounted = useRef(true);

  // Form States
  const [taskText, setTaskText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("free");
  const [assignee, setAssignee] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [requestedRole, setRequestedRole] = useState("member");
  const [editingTask, setEditingTask] = useState(null);

  // --- 1. WORKSPACE FETCHING ---
  const fetchWorkspaces = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("memberships")
        .select(`role, is_approved, companies (id, name, invite_code)`)
        .eq("user_id", userId);
      
      if (error) throw error;
      
      if (isMounted.current) {
        const wsData = data || [];
        setWorkspaces(wsData);
        
        setActiveWS(current => {
          if (current) {
            const stillExists = wsData.find(w => w.companies.id === current.companies.id);
            return stillExists || null;
          }
          return wsData.find(w => w.is_approved) || wsData[0] || null;
        });
      }
    } catch (err) {
      console.error("Workspace Fetch Error:", err.message);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  // --- 2. DASHBOARD DATA SYNC (TASKS & MEMBERS) ---
  const fetchWorkspaceData = useCallback(async () => {
    if (!activeWS?.companies?.id) return;
    const coId = activeWS.companies.id;

    try {
      const [tasksRes, membersRes] = await Promise.all([
        supabase.from("tasks")
          .select(`*, profiles:assigned_to(email)`)
          .eq("company_id", coId)
          .order("created_at", { ascending: false }),
        supabase.from("memberships")
          .select(`user_id, role, is_approved, profiles:user_id(email)`)
          .eq("company_id", coId)
      ]);

      if (membersRes.error) throw membersRes.error;
      if (tasksRes.error) throw tasksRes.error;

      if (isMounted.current) {
        setTasks(tasksRes.data || []);
        const allMembers = membersRes.data || [];
        
        // Strictly filter by boolean true
        setTeam(allMembers.filter(m => m.is_approved === true));
        
        if (activeWS.role === 'admin' || activeWS.role === 'manager') {
          // Strictly filter by everything else (false or null)
          setPendingMembers(allMembers.filter(m => m.is_approved !== true));
        } else {
          setPendingMembers([]);
        }
      }
    } catch (err) {
      console.error("Data Sync Error:", err.message);
    }
  }, [activeWS]);

  // --- 3. AUTH & LIFECYCLE ---
  useEffect(() => {
    isMounted.current = true;

    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted.current) {
        if (session?.user) {
          setUser(session.user);
          await fetchWorkspaces(session.user.id);
        } else {
          setLoading(false);
        }
      }
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted.current) {
        const sUser = session?.user || null;
        setUser(sUser);
        if (sUser) {
          fetchWorkspaces(sUser.id);
        } else {
          setWorkspaces([]);
          setActiveWS(null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted.current = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (activeWS?.companies?.id && activeWS.is_approved) {
      fetchWorkspaceData();
    }
  }, [activeWS?.companies?.id, activeWS?.is_approved, fetchWorkspaceData]);

  // --- 4. ACTION HANDLERS ---
  const handleCreateOrg = async () => {
    if (!newOrgName.trim() || actionLoading) return;
    setActionLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: co, error: coErr } = await supabase
        .from("companies")
        .insert([{ name: newOrgName, invite_code: code }])
        .select().single();
      
      if (coErr) throw coErr;

      const { error: memErr } = await supabase.from("memberships").insert([
        { user_id: user.id, company_id: co.id, role: 'admin', is_approved: true }
      ]);
      if (memErr) throw memErr;

      setNewOrgName("");
      await fetchWorkspaces(user.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinOrg = async () => {
    if (!inviteCodeInput.trim() || actionLoading) return;
    setActionLoading(true);
    try {
      const { data: co } = await supabase
        .from("companies")
        .select("id, name")
        .eq("invite_code", inviteCodeInput.toUpperCase())
        .maybeSingle();
      
      if (!co) throw new Error("Invalid code");

      const { error } = await supabase.from("memberships").insert([
        { user_id: user.id, company_id: co.id, role: requestedRole, is_approved: false }
      ]);
      if (error) throw error;

      setInviteCodeInput("");
      alert("Request sent! Please wait for admin approval.");
      await fetchWorkspaces(user.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // --- RENDER ---
  if (loading) return <div className="loading-screen">INITIALIZING...</div>;
  if (!user) return <Auth onAuthSuccess={setUser} />;

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-left">
          <div className="logo-icon">◈</div>
          <select 
            className="org-select"
            value={activeWS?.companies?.id || ""} 
            onChange={(e) => {
                const selected = workspaces.find(w => w.companies.id === e.target.value);
                setActiveWS(selected || null);
            }}
          >
            <option value="">Organization Hub</option>
            {workspaces.map(w => (
              <option key={w.companies.id} value={w.companies.id}>
                {w.companies.name} {!w.is_approved ? '(Pending)' : ''}
              </option>
            ))}
          </select>
        </div>
        <button className="sign-out-btn" onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </header>

      <main className="content-area">
        {!activeWS ? (
          <OrgHub 
            newOrgName={newOrgName} setNewOrgName={setNewOrgName} 
            inviteCodeInput={inviteCodeInput} setInviteCodeInput={setInviteCodeInput} 
            requestedRole={requestedRole} setRequestedRole={setRequestedRole}
            onCreate={handleCreateOrg} onJoin={handleJoinOrg}
            actionLoading={actionLoading} 
          />
        ) : !activeWS.is_approved ? (
          <div className="focus-card text-center">
            <h2>Approval Pending</h2>
            <p>Waiting for admin approval for <strong>{activeWS.companies.name}</strong>.</p>
            <button className="add-btn" style={{marginTop: '20px'}} onClick={() => setActiveWS(null)}>
              Back to Hub
            </button>
          </div>
        ) : (
          <TaskDashboard 
            activeWS={activeWS} tasks={tasks} team={team} user={user}
            pendingMembers={pendingMembers} 
            onApproveMember={async (userId) => {
              const { error } = await supabase
                .from("memberships")
                .update({ is_approved: true })
                .eq("company_id", activeWS.companies.id)
                .eq("user_id", userId);
              
              if (error) {
                alert("Approval failed: " + error.message);
              } else {
                // Wait for the sync to complete before UI updates
                await fetchWorkspaceData();
              }
            }}
            onRejectMember={async (userId) => {
              const { error } = await supabase
                .from("memberships")
                .delete()
                .eq("company_id", activeWS.companies.id)
                .eq("user_id", userId);
              
              if (error) {
                alert("Rejection failed: " + error.message);
              } else {
                await fetchWorkspaceData();
              }
            }}
            taskText={taskText} setTaskText={setTaskText} 
            deadline={deadline} setDeadline={setDeadline} 
            priority={priority} setPriority={setPriority}
            assignee={assignee} setAssignee={setAssignee} 
            onAddTask={async (e) => {
              e.preventDefault();
              const { error } = await supabase.from("tasks").insert([
                { 
                    company_id: activeWS.companies.id, 
                    text: taskText, 
                    deadline: deadline || null, 
                    priority, 
                    assigned_to: assignee || user.id, 
                    created_by: user.id, 
                    is_completed: false 
                }
              ]);
              if (error) alert(error.message);
              else {
                setTaskText(""); 
                setDeadline(""); 
                await fetchWorkspaceData();
              }
            }} 
            editingTask={editingTask} setEditingTask={setEditingTask}
            onToggleComplete={async (id, state) => {
              await supabase.from("tasks").update({ is_completed: !state }).eq("id", id);
              await fetchWorkspaceData();
            }} 
            onUpdateTask={async (e) => {
              e.preventDefault();
              await supabase.from("tasks").update(editingTask).eq("id", editingTask.id);
              setEditingTask(null); 
              await fetchWorkspaceData();
            }} 
            onDeleteTask={async (id) => {
              if (window.confirm("Delete task?")) { 
                  await supabase.from("tasks").delete().eq("id", id); 
                  await fetchWorkspaceData(); 
              }
            }} 
            onDeleteOrg={async () => {
              if (window.confirm("CRITICAL: Delete entire organization and all data?")) {
                const { error } = await supabase.from("companies").delete().eq("id", activeWS.companies.id);
                if (error) alert(error.message);
                else {
                    setActiveWS(null); 
                    await fetchWorkspaces(user.id);
                }
              }
            }}
            onRemoveMember={async (userId) => {
              if (window.confirm("Remove this member?")) {
                await supabase.from("memberships").delete().eq("company_id", activeWS.companies.id).eq("user_id", userId);
                await fetchWorkspaceData();
              }
            }} 
            onLeaveOrg={async () => {
              if(window.confirm("Leave this organization?")) {
                await supabase.from("memberships").delete().eq("company_id", activeWS.companies.id).eq("user_id", user.id);
                setActiveWS(null); 
                await fetchWorkspaces(user.id);
              }
            }}
            onUpdateMemberRole={async (userId, role) => {
              await supabase.from("memberships").update({ role }).eq("company_id", activeWS.companies.id).eq("user_id", userId);
              await fetchWorkspaceData();
            }}           
          />
        )}
      </main>
    </div>
  );
}