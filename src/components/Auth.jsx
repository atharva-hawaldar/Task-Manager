    import React, { useState } from "react";
    import { supabase } from "../supabaseClient";

    const Auth = ({ onAuthSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleAuth = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
            },
            });

            if (error) throw error;

            // Note: data.session will be null if email confirmation is required
            if (data?.user && data?.session) {
            onAuthSuccess(data.user);
            } else {
            setMessage({ 
                type: "success", 
                text: "Check your inbox! We've sent a verification link." 
            });
            }
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            });

            if (error) throw error;
            if (data?.user) onAuthSuccess(data.user);
        }
        } catch (error) {
        setMessage({ type: "error", text: error.message });
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper animate-fade">
        <div className="auth-card">
            <div className="logo-icon" style={{ fontSize: "2.5rem", marginBottom: "15px" }}>◈</div>
            
            <h2 style={{ marginBottom: "10px" }}>
            {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: "25px" }}>
            {isSignUp 
                ? "Start managing your organization's tasks today." 
                : "Log in to access your dashboard."}
            </p>

            {/* Status Message Display */}
            {message.text && (
            <div className={`status-msg ${message.type}`} style={{
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "20px",
                fontSize: "0.85rem",
                backgroundColor: message.type === "error" ? "rgba(255, 107, 107, 0.1)" : "rgba(78, 205, 196, 0.1)",
                color: message.type === "error" ? "#ff6b6b" : "var(--leaf-bright)",
                border: `1px solid ${message.type === "error" ? "#ff6b6b33" : "#4ecdc433"}`
            }}>
                {message.text}
            </div>
            )}

            <form onSubmit={handleAuth} className="task-form">
            <div className="input-group">
                <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="auth-input"
                />
            </div>
            <div className="input-group">
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="auth-input"
                />
            </div>
            
            <button 
                type="submit" 
                className="add-btn" 
                disabled={loading}
                style={{ width: "100%", marginTop: "10px" }}
            >
                {loading ? "Please wait..." : isSignUp ? "Create Account" : "Login"}
            </button>
            </form>

            <div className="divider" style={{ margin: "25px 0", display: "flex", alignItems: "center", color: "var(--text-dim)" }}>
            <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--border-color)", opacity: 0.2 }} />
            <span style={{ padding: "0 15px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>OR</span>
            <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--border-color)", opacity: 0.2 }} />
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>
            {isSignUp ? "Already have an account?" : "New to the platform?"}{" "}
            <span
                style={{ 
                color: "var(--leaf-bright)", 
                cursor: "pointer", 
                fontWeight: "600",
                textDecoration: "underline"
                }}
                onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage({ type: "", text: "" }); // Clear errors when switching
                setEmail("");
                setPassword("");
                }}
            >
                {isSignUp ? "Sign In" : "Register Now"}
            </span>
            </p>
        </div>
        </div>
    );
    };

    export default Auth;