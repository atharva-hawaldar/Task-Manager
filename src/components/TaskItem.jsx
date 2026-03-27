    import React from "react";

    const TaskItem = ({ 
    task, isAdmin, isEditing, editState, setEditState, 
    onToggle, onUpdate, onDelete, onCancelEdit 
    }) => {
    if (isEditing) {
        return (
        <div className="task-item editing" data-priority={editState.priority}>
            <form onSubmit={onUpdate} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
            <input value={editState.text} onChange={(e) => setEditState({ ...editState, text: e.target.value })} />
            <div style={{ display: "flex", gap: "10px" }}>
                <input type="date" value={editState.deadline} onChange={(e) => setEditState({ ...editState, deadline: e.target.value })} />
                <select value={editState.priority} onChange={(e) => setEditState({ ...editState, priority: e.target.value })}>
                <option value="free">Free</option>
                <option value="medium">Medium</option>
                <option value="urgent">Urgent</option>
                </select>
                <button type="submit" className="add-btn">Save</button>
                <button type="button" onClick={onCancelEdit} className="del-btn-small">Cancel</button>
            </div>
            </form>
        </div>
        );
    }

    return (
        <div className={`task-item ${task.is_completed ? "status-completed" : ""}`} data-priority={task.priority}>
        <div className="task-left">
            <input 
            type="checkbox" 
            checked={task.is_completed} 
            onChange={() => onToggle(task.id, task.is_completed)} 
            />
            <div className="task-content">
            <strong style={{ textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                {task.text}
            </strong>
            <div className="task-meta">
                <span>Assigned to: {task.profiles?.email || "Self"}</span>
                <span> • Due: {task.deadline}</span>
            </div>
            </div>
        </div>
        {isAdmin && (
            <div className="task-actions">
            <button onClick={() => setEditState(task)} className="edit-btn-small">Edit</button>
            <button onClick={() => onDelete(task.id)} className="del-btn-small">Delete</button>
            </div>
        )}
        </div>
    );
    };

    export default TaskItem;