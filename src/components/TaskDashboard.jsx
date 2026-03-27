import React from "react";
import StatCard from "./StatCard";
import ProgressBar from "./ProgressBar";
import TaskItem from "./TaskItem";

const TaskDashboard = ({ 
    activeWS, 
    tasks = [], 
    team = [], 
    user, 
    pendingMembers = [], 
    onApproveMember, 
    onRejectMember,
    taskText, 
    setTaskText, 
    deadline, 
    setDeadline, 
    priority, 
    setPriority, 
    assignee, 
    setAssignee, 
    onAddTask, 
    editingTask, 
    setEditingTask, 
    onToggleComplete, 
    onUpdateTask, 
    onDeleteTask, 
    onDeleteOrg,
    onRemoveMember, 
    onLeaveOrg,
    onUpdateMemberRole 
}) => {

    // ROLE HIERARCHY
    const isAdmin = activeWS?.role === 'admin';
    const isManager = activeWS?.role === 'manager';
    const canManage = isAdmin || isManager;

    return (
        <main className="animate-fade" style={{ paddingBottom: '50px' }}>
            {/* 1. TOP STATS */}
            <div className="dashboard-stats">
                <StatCard value={tasks.length} label="TOTAL TASKS" />
                <StatCard value={tasks.filter(t => !t.is_completed).length} label="PENDING" />
                <StatCard value={activeWS?.companies?.invite_code || "N/A"} label="INVITE CODE" isCode />
            </div>
            
            <ProgressBar tasks={tasks} />

            {/* 2. TASK ASSIGNMENT FORM (ADMIN/MANAGER ONLY) */}
            {canManage && (
                <div className="focus-card animate-slide-up">
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>{isAdmin ? "Admin: Assign Task" : "Manager: Assign Task"}</h3>
                        <span className="priority-tag urgent" style={{ fontSize: '0.7rem' }}>{activeWS.role?.toUpperCase()}</span>
                    </div>
                    <form onSubmit={onAddTask} className="task-form">
                        <input 
                            placeholder="What needs to be done?" 
                            value={taskText} 
                            onChange={e => setTaskText(e.target.value)} 
                            required 
                        />
                        <div className="form-row" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '5px' }}>Deadline</label>
                                <input 
                                    type="date" 
                                    value={deadline} 
                                    onChange={e => setDeadline(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '5px' }}>Priority</label>
                                <select value={priority} onChange={e => setPriority(e.target.value)}>
                                    <option value="free">Free</option>
                                    <option value="medium">Medium</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '5px' }}>Assign To</label>
                                <select value={assignee} onChange={e => setAssignee(e.target.value)}>
                                    <option value={user.id}>Assign to Me (You)</option>
                                    {team.map(m => (
                                        m.user_id !== user.id && (
                                            <option key={m.user_id} value={m.user_id}>
                                                {m.profiles?.email || "Team Member"}
                                            </option>
                                        )
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="add-btn" style={{ marginTop: '15px', width: '100%' }}>
                            Assign Task to Workspace
                        </button>
                    </form>
                </div>
            )}

            {/* 3. MASTER BOARD */}
            <div className="focus-card">
                <h3>Master Board</h3>
                <div className="task-list">
                    {tasks.length > 0 ? (
                        tasks.map(t => (
                            <TaskItem 
                                key={t.id} 
                                task={t} 
                                isAdmin={canManage} 
                                isEditing={editingTask?.id === t.id} 
                                editState={editingTask} 
                                setEditState={setEditingTask} 
                                onToggle={onToggleComplete} 
                                onUpdate={onUpdateTask} 
                                onDelete={onDeleteTask}
                                onCancelEdit={() => setEditingTask(null)} 
                            />
                        ))
                    ) : (
                        <div className="empty-state">No tasks found.</div>
                    )}
                </div>
            </div>

            {/* 4. PENDING REQUESTS */}
            {canManage && (
                <div className="focus-card" style={{ borderColor: 'var(--leaf-bright)' }}>
                    <h3 style={{ color: 'var(--leaf-bright)' }}>Pending Join Requests</h3>
                    <div className="task-list">
                        {pendingMembers && pendingMembers.length > 0 ? (
                            pendingMembers.map(member => (
                                <div key={member.user_id} className="task-item" style={{ background: 'rgba(0, 255, 127, 0.05)' }}>
                                    <div className="task-left">
                                        <span className={`priority-tag ${member.role === 'manager' ? 'urgent' : 'medium'}`}>
                                            {member.role?.toUpperCase() || 'MEMBER'}
                                        </span>
                                        <div className="task-content">
                                            <strong>{member.profiles?.email || "New User"}</strong>
                                            <div className="task-meta">Requested Access</div>
                                        </div>
                                    </div>
                                    <div className="task-actions">
                                        <button 
                                            onClick={() => onApproveMember(member.user_id)} 
                                            className="add-btn" 
                                            style={{ padding: '5px 15px' }}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => onRejectMember(member.user_id)} 
                                            className="del-btn-small"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">No pending join requests.</p>
                        )}
                    </div>
                </div>
            )}

            {/* 5. TEAM ROSTER - Now fully visible to Managers */}
            <div className="focus-card">
                <h3>Team Roster</h3>
                <div className="task-list">
                    {team.length > 0 ? team.map(member => (
                        <div key={member.user_id} className="task-item" style={{ borderLeft: "4px solid #444" }}>
                            <div className="task-left">
                                <div className="task-content">
                                    <strong>{member.profiles?.email || "Unknown Email"}</strong>
                                    <div className="task-meta">
                                        Role: <span style={{color: 'var(--leaf-bright)', fontWeight: 'bold'}}>
                                            {member.user_id === user.id 
                                                ? `${(member.role || 'Member').toUpperCase()} (You)` 
                                                : (member.role || 'Member')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Member Management Actions - Strictly for Admins */}
                            {isAdmin && member.user_id !== user.id && (
                                <div className="task-actions">
                                    <button 
                                        onClick={() => onUpdateMemberRole(member.user_id, member.role === 'manager' ? 'member' : 'manager')} 
                                        className="add-btn" 
                                        style={{ padding: '5px 10px', fontSize: '0.7rem', background: member.role === 'manager' ? '#444' : '' }}
                                    >
                                        {member.role === 'manager' ? 'Demote to Member' : 'Promote to Manager'}
                                    </button>
                                    <button onClick={() => onRemoveMember(member.user_id)} className="del-btn-small">
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    )) : (
                        <p className="empty-state">No team members found.</p>
                    )}
                </div>
            </div>

            {/* 6. SETTINGS ZONE */} 
            <div className="focus-card danger-zone" style={{ marginTop: '40px' }}>
                <h3>Workspace Settings</h3>
                <div className="danger-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isAdmin ? (
                        <>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Danger: This will delete all tasks and member records.</p>
                            <button onClick={onDeleteOrg} className="del-btn-outline">
                                Delete Org
                            </button>
                        </>
                    ) : (
                        <>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>You are currently a member of this workspace.</p>
                            <button onClick={onLeaveOrg} className="del-btn-outline">
                                Leave Org
                            </button>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};

export default TaskDashboard;