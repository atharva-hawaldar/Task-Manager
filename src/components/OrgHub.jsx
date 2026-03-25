    import React from "react";

    const OrgHub = ({ newOrgName, setNewOrgName, inviteCodeInput, setInviteCodeInput, onCreate, onJoin }) => (
    <main className="animate-fade no-workspace-wrapper">
        <div className="focus-card">
        <h2>Organization Hub</h2>
        <div className="auth-form" style={{ marginTop: '20px' }}>
            <input 
            placeholder="New Org Name" 
            value={newOrgName} 
            onChange={e => setNewOrgName(e.target.value)} 
            />
            <button className="add-btn" onClick={onCreate}>Create Organization</button>
        </div>
        <div className="divider"><span>OR</span></div>
        <div className="auth-form">
            <input 
            placeholder="Enter Invite Code" 
            value={inviteCodeInput} 
            onChange={e => setInviteCodeInput(e.target.value)} 
            />
            <button className="add-btn" onClick={onJoin}>Join Organization</button>
        </div>
        </div>
    </main>
    );

    export default OrgHub;