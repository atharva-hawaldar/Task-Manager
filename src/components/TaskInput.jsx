    import { useState } from "react";

    function TaskInput({ addTask }) {
    const [input, setInput] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [category, setCategory] = useState("Work");
    const [assignee, setAssignee] = useState("");
    const [deadline, setDeadline] = useState("");

    const handleAdd = () => {
        if (input.trim() === "") return;
        addTask(input, priority, category, assignee, deadline);
        
        // Reset fields after adding
        setInput("");
        setAssignee("");
        setDeadline("");
    };

    return (
        <div className="admin-input-panel">
        <div className="input-row main-input">
            <input 
            type="text" 
            placeholder="What needs to be done?" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button onClick={handleAdd} className="add-btn">Assign Task</button>
        </div>

        <div className="input-row options-row">
            <input 
            type="text" 
            placeholder="Assign to (e.g., Sarah)" 
            value={assignee} 
            onChange={(e) => setAssignee(e.target.value)}
            className="assignee-input"
            />
            <input 
            type="date" 
            value={deadline} 
            onChange={(e) => setDeadline(e.target.value)}
            className="date-input"
            />
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="High">High Priority</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Urgent">Urgent</option>
            </select>
        </div>
        </div>
    );
    }

    export default TaskInput;