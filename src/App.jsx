import { useState, useEffect } from "react";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";
import TaskFilters from "./components/TaskFilters";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [userRole, setUserRole] = useState("Admin"); 
  const [isSwitching, setIsSwitching] = useState(false);

  // Trigger animation when role changes
  const handleRoleChange = (newRole) => {
    setIsSwitching(true);
    setTimeout(() => {
      setUserRole(newRole);
      setIsSwitching(false);
    }, 500); // Duration of the "Login" animation
  };

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text, priority, category, assignee, deadline) => {
    const newTask = { 
      id: Date.now(), 
      text, priority, category, 
      assignee: assignee || "Unassigned",
      deadline: deadline || "",
      completed: false,
      createdAt: new Date().toLocaleDateString()
    };
    setTasks([newTask, ...tasks]);
  };

  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));
  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };
  const updateTask = (id, newText) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || task.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`app-container ${userRole.toLowerCase()}-theme ${isSwitching ? "switching" : ""}`}>
      <div className="glass-overlay"></div>
      
      <header className="main-header">
        <div className="header-left">
          <div className="logo-icon">✦</div>
          <h1>{userRole === "Admin" ? "Control Center" : "My Workspace"}</h1>
        </div>

        <div className="role-portal">
          <button 
            className={userRole === "Admin" ? "active" : ""} 
            onClick={() => handleRoleChange("Admin")}
          >
            Manager
          </button>
          <button 
            className={userRole === "Employee" ? "active" : ""} 
            onClick={() => handleRoleChange("Employee")}
          >
            Staff
          </button>
        </div>
      </header>

      <main className={`content-fade ${isSwitching ? "out" : "in"}`}>
        {userRole === "Admin" ? (
          /* --- ADMIN DASHBOARD VIEW --- */
          <div className="admin-layout">
            <div className="dashboard-stats">
              <div className="stat-card blue"><h3>{tasks.length}</h3><p>Total Tasks</p></div>
              <div className="stat-card orange"><h3>{tasks.filter(t => !t.completed).length}</h3><p>Active</p></div>
              <div className="stat-card green"><h3>{tasks.filter(t => t.completed).length}</h3><p>Done</p></div>
            </div>
            
            <TaskInput addTask={addTask} />
            
            <div className="task-grid">
              <div className="grid-col">
                <div className="col-header"><h2>Live Queue</h2></div>
                <TaskList tasks={filteredTasks.filter(t => !t.completed)} deleteTask={deleteTask} toggleTask={toggleTask} updateTask={updateTask} userRole={userRole} />
              </div>
              <div className="grid-col">
                <div className="col-header"><h2>Archive</h2></div>
                <TaskList tasks={filteredTasks.filter(t => t.completed)} deleteTask={deleteTask} toggleTask={toggleTask} updateTask={updateTask} userRole={userRole} isCompletedList />
              </div>
            </div>
          </div>
        ) : (
          /* --- EMPLOYEE FOCUS VIEW --- */
          <div className="employee-layout">
            <div className="focus-card">
              <div className="focus-header">
                <h2>Priority Tasks</h2>
                <TaskFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterCategory={filterCategory} setFilterCategory={setFilterCategory} />
              </div>
              <TaskList tasks={filteredTasks.filter(t => !t.completed)} deleteTask={deleteTask} toggleTask={toggleTask} updateTask={updateTask} userRole={userRole} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;