    import TaskItem from "./TaskItem";

    function TaskList({ tasks, deleteTask, toggleTask, updateTask, isCompletedList, userRole }) {
    return (
        <ul className="task-list">
        {tasks.map((task) => (
            <TaskItem
            key={task.id}
            task={task}
            deleteTask={deleteTask}
            toggleTask={toggleTask}
            updateTask={updateTask}
            isCompletedList={isCompletedList}
            userRole={userRole} /* NEW: Passing role down */
            />
        ))}
        </ul>
    );
    }

    export default TaskList;