    import React from "react";

    const StatCard = ({ value, label, isCode = false }) => (
    <div className={`stat-card ${isCode ? "code-card" : ""}`}>
        <h3>{value}</h3>
        <p>{label}</p>
    </div>
    );

    export default StatCard;