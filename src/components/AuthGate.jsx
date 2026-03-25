    import { useState } from "react";
    import { supabase } from "../supabaseClient";

    function AuthGate({ onAuthSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [role, setRole] = useState("employee"); // admin or employee
    const [companyName, setCompanyName] = useState("");
    const [inviteCode, setInviteCode] = useState("");

    const handleAuth = async (e) => {
        e.preventDefault();
        // Your login/signup logic here (from previous turns)
    };

    return (
        <div className="auth-container">
        <div className="auth-card">
            <div className="logo-icon">✦</div>
            <h2>{isSignUp ? "Join the Jungle" : "Welcome Back"}</h2>
            
            <form onSubmit={handleAuth}>
            {isSignUp && (
                <div className="role-selector">
                <button 
                    type="button" 
                    className={role === "admin" ? "active" : ""} 
                    onClick={() => setRole("admin")}
                >Manager</button>
                <button 
                    type="button" 
                    className={role === "employee" ? "active" : ""} 
                    onClick={() => setRole("employee")}
                >Staff</button>
                </div>
            )}

            <input 
                type="email" 
                placeholder="Email Address" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
            <input 
                type="password" 
                placeholder="Password" 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />

            {isSignUp && role === "admin" && (
                <input 
                type="text" 
                placeholder="Company Name" 
                onChange={(e) => setCompanyName(e.target.value)} 
                required 
                />
            )}

            {isSignUp && role === "employee" && (
                <input 
                type="text" 
                placeholder="Invite Code" 
                onChange={(e) => setInviteCode(e.target.value)} 
                required 
                />
            )}

            <button type="submit" className="auth-btn">
                {isSignUp ? "Get Started" : "Sign In"}
            </button>
            </form>

            <p onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Already a member? Sign In" : "Need a workspace? Join us"}
            </p>
        </div>
        </div>
    );
    }

    export default AuthGate;