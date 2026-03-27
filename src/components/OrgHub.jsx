    import React from "react";

    const OrgHub = ({ 
    newOrgName, 
    setNewOrgName, 
    inviteCodeInput, 
    setInviteCodeInput, 
    requestedRole,
    setRequestedRole,
    onCreate, 
    onJoin,
    actionLoading // Pass this from App.jsx for better sync
    }) => {

    return (
        <main className="animate-fade auth-wrapper">
        <div className="focus-card" style={{ maxWidth: '450px', margin: 'auto', padding: '30px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--leaf-bright)', letterSpacing: '1px' }}>
            Organization Hub
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '30px' }}>
            Create a new workspace or join an existing team.
            </p>
            
            {/* SECTION 1: CREATE */}
            <div className="task-form" style={{ marginBottom: '30px' }}>
            <label style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Start a New Team
            </label>
            <input 
                placeholder="e.g. Acme Marketing Team" 
                value={newOrgName} 
                onChange={e => setNewOrgName(e.target.value)} 
                className="form-input"
                disabled={actionLoading}
                style={{ width: '100%', padding: '12px', background: 'var(--bg-deep)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }}
            />
            <button 
                className="add-btn" 
                onClick={onCreate}
                disabled={!newOrgName.trim() || actionLoading}
                style={{ width: '100%', marginTop: '12px', padding: '12px', fontWeight: 'bold' }}
            >
                {actionLoading && newOrgName ? "Creating..." : "Create Organization"}
            </button>
            </div>

            <div className="divider" style={{ margin: '25px 0', display: 'flex', alignItems: 'center', color: 'var(--text-dim)' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)', opacity: 0.3 }} />
            <span style={{ padding: '0 15px', fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.5 }}>OR</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)', opacity: 0.3 }} />
            </div>

            {/* SECTION 2: JOIN */}
            <div className="task-form">
            <label style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Join Existing Team
            </label>
            <input 
                placeholder="6-DIGIT CODE" 
                value={inviteCodeInput} 
                maxLength={6}
                onChange={e => setInviteCodeInput(e.target.value.toUpperCase().trim())} 
                className="form-input"
                disabled={actionLoading}
                style={{ 
                width: '100%', 
                letterSpacing: '4px', 
                textAlign: 'center', 
                fontWeight: 'bold', 
                fontSize: '1.1rem',
                padding: '12px',
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--leaf-bright)'
                }}
            />
            
            <div style={{ margin: '15px 0' }}>
                <label style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginBottom: '5px', display: 'block' }}>
                Select your role:
                </label>
                <select 
                value={requestedRole} 
                onChange={(e) => setRequestedRole(e.target.value)}
                className="org-select"
                disabled={actionLoading}
                style={{ 
                    width: '100%', 
                    padding: '12px', 
                    background: 'var(--bg-deep)', 
                    color: 'var(--text-main)', 
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
                >
                <option value="member">Regular Member</option>
                <option value="manager">Manager / Lead</option>
                </select>
            </div>

            <button 
                className="add-btn" 
                onClick={onJoin}
                disabled={inviteCodeInput.length !== 6 || actionLoading}
                style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}
            >
                {actionLoading && inviteCodeInput ? "Joining..." : "Send Join Request"}
            </button>
            </div>
        </div>
        </main>
    );
    };

    export default OrgHub;