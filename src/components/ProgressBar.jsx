    import React from "react";

    const ProgressBar = ({ tasks }) => {
    const completion = tasks.length
        ? (tasks.filter((t) => t.is_completed).length / tasks.length) * 100
        : 0;

    return (
        <div className="progress-container">
        <div className="progress-fill" style={{ width: `${completion}%` }}></div>
        </div>
    );
    };

    export default ProgressBar;