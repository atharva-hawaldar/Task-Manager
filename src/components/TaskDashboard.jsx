    import React from "react";
    import StatCard from "./StatCard";
    import ProgressBar from "./ProgressBar";
    import TaskItem from "./TaskItem";

    const TaskDashboard = ({ 
    activeWS, tasks, team, user, taskText, setTaskText, 
    deadline, setDeadline, priority, setPriority, 
    assignee, setAssignee, onAddTask, editingTask, 
    setEditingTask, onToggleComplete, onUpdateTask, onDeleteTask 
    }) => (
    <main className="animate-fade">
        <div className="dashboard-stats">
        <StatCard value={tasks.length} label="TASKS" />
        <StatCard value={tasks.filter(t => !t.is_completed).length} label="PENDING" />
        <StatCard value={activeWS.companies.invite_code} label="INVITE CODE" isCode />
        </div>
        <ProgressBar tasks={tasks} />

        {activeWS.role === 'admin' && (
        <div className="admin-panel focus-card">
            <h3>Assign Task</h3>
            <form onSubmit={onAddTask} className="task-form">
            <input placeholder="Task..." value={taskText} onChange={e => setTaskText(e.target.value)} required />
            <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required />
                <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="free">Free</option>
                <option value="medium">Medium</option>
                <option value="urgent">Urgent</option>
                </select>
            </div>
            <select value={assignee} onChange={e => setAssignee(e.target.value)}>
                <option value={user.id}>Myself</option>
                {team.filter(m => m.user_id !== user.id).map(m => (
                <option key={m.user_id} value={m.user_id}>{m.profiles?.email}</option>
                ))}
            </select>
            <button type="submit" className="add-btn">Assign</button>
            </form>
        </div>
        )}

        <div className="focus-card section-spacing">
        <h3>Master Board</h3>
        <div className="task-list">
            {tasks.map(t => (
            <TaskItem 
                key={t.id} task={t} isAdmin={activeWS.role === 'admin'}
                isEditing={editingTask?.id === t.id} editState={editingTask} setEditState={setEditingTask}
                onToggle={onToggleComplete} onUpdate={onUpdateTask} onDelete={onDeleteTask}
                onCancelEdit={() => setEditingTask(null)} team={team} userId={user.id}
            />
            ))}
        </div>
        </div>
    </main>
    );

    export default TaskDashboard;