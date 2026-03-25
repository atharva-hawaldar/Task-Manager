    import { useState } from "react";

    function TaskItem({ task, deleteTask, toggleTask, updateTask, isCompletedList, userRole }) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempText, setTempText] = useState(task.text);

    const handleSave = () => {
        updateTask(task.id, tempText);
        setIsEditing(false);
    };

    // --- DEADLINE LOGIC ---
    const getDeadlineStatus = () => {
        if (!task.deadline) return null;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for accurate day calculation
        const dueDate = new Date(task.deadline);
        
        // Calculate difference in days
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Overdue", color: "red" };
        if (diffDays <= 2) return { text: `Due in ${diffDays} days`, color: "red" };
        if (diffDays <= 5) return { text: `Due in ${diffDays} days`, color: "orange" };
        return { text: `Due in ${diffDays} days`, color: "green" };
    };

    const deadlineInfo = getDeadlineStatus();

    return (
        <li className={`${task.completed ? "completed" : ""} priority-${task.priority.toLowerCase()}`}>
        
        {/* Both Admins and Employees can check/uncheck tasks */}
        <input 
            type="checkbox" 
            checked={task.completed} 
            onChange={() => toggleTask(task.id)} 
        />
        
        <div className="task-content">
            {isEditing ? (
            <input className="edit-input" value={tempText} onChange={(e) => setTempText(e.target.value)} onBlur={handleSave} autoFocus />
            ) : (
            <>
                <span className="task-text">{task.text}</span>
                <div className="task-meta">
                <span className="assignee-badge">👤 {task.assignee}</span>
                
                {/* Deadline Badge */}
                {deadlineInfo && !task.completed && (
                    <span className={`deadline-badge ${deadlineInfo.color}`}>
                    ⏰ {deadlineInfo.text}
                    </span>
                )}
                
                <span className="tag">{task.category}</span>
                </div>
            </>
            )}
        </div>

        {/* ONLY Admins can Delete or Edit */}
        {userRole === "Admin" && (
            <div className="item-actions">
            {!isCompletedList && (
                <button onClick={() => setIsEditing(!isEditing)} className="edit-btn">✎</button>
            )}
            <button onClick={() => deleteTask(task.id)} className="delete-btn">✕</button>
            </div>
        )}
        </li>
    );
    }

    export default TaskItem;