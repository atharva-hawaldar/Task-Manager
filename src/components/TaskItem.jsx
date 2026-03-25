    import React from "react";

    const TaskItem = ({ 
    task, isAdmin, isEditing, editState, setEditState, 
    onToggle, onUpdate, onDelete, onCancelEdit, team, userId 
    }) => {
    if (isEditing) {
        return (
        <div className="task-item" data-priority={editState.priority}>
            <form onSubmit={onUpdate} className="task-form-edit" style={{ width: "100%" }}>
            <input
                value={editState.text}
                onChange={(e) => setEditState({ ...editState, text: e.target.value })}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <input type="date" value={editState.deadline} onChange={(e) => setEditState({ ...editState, deadline: e.target.value })} />
                <select value={editState.priority} onChange={(e) => setEditState({ ...editState, priority: e.target.value })}>
                <option value="free">Free</option>
                <option value="medium">Medium</option>
                <option value="urgent">Urgent</option>
                </select>
                <select value={editState.assigned_to} onChange={(e) => setEditState({ ...editState, assigned_to: e.target.value })}>
                <option value={userId}>Myself</option>
                {team.filter(m => m.user_id !== userId).map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.profiles?.email}</option>
                ))}
                </select>
                <button type="submit" className="add-btn">Save</button>
                <button type="button" onClick={onCancelEdit} className="del-btn-small">X</button>
            </div>
            </form>
        </div>
        );
    }

    return (
        <div className={`task-item ${task.is_completed ? "status-completed" : ""}`} data-priority={task.priority}>
        <div className="task-left">
            <input type="checkbox" checked={task.is_completed} onChange={() => onToggle(task.id, task.is_completed)} />
            <div className="task-content">
            <strong>{task.text}</strong>
            <div className="task-meta">{task.profiles?.email || "Self"} • {task.deadline}</div>
            </div>
        </div>
        {isAdmin && (
            <div className="task-actions">
            <button onClick={() => setEditState(task)} className="edit-btn-small">Edit</button>
            <button onClick={() => onDelete(task.id)} className="del-btn-small">Del</button>
            </div>
        )}
        </div>
    );
    };

    export default TaskItem;