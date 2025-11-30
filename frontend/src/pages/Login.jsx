import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { authAPI } from '../services/api';
import api from '../services/api'; // for forgot username

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotType, setForgotType] = useState('password');
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from || '/dashboard';
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const result = await login(username, password);
        
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.error);
            setLoading(false);
        }
    };
    

const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setForgotSuccess('');
    
    try {
        if (forgotType === 'password') {
            await authAPI.forgotPassword(forgotEmail);
            setForgotSuccess('Password reset link sent to your email!');
        } else {
            await api.post('/users/forgot-username/', { email: forgotEmail });
            setForgotSuccess('Username sent to your email!');
        }
        
        setForgotEmail('');
    } catch (error) {
        setError(error.response?.data?.message || 'Failed to send email. Please try again.');
    }
};
    
    return (
        <section className="auth-page">
            <div className="container">
                <div className="auth-box">
                    <div className="auth-header">
                        <div className="auth-icon">🎬</div>
                        <h1>Welcome Back</h1>
                        <p className="subtitle">Sign in to continue your cinema experience</p>
                    </div>
                    
                    {error && <div className="alert alert-error">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="username">
                                <span className="label-icon">👤</span>
                                Username
                            </label>
                            <input 
                                type="text" 
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required 
                                autoFocus
                                placeholder="Enter your username"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">
                                <span className="label-icon">🔒</span>
                                Password
                            </label>
                            <input 
                                type="password" 
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                            />
                        </div>
                        
                        <button type="submit" className="btn-primary btn-auth" disabled={loading}>
                            {loading ? (
                                <><span className="spinner"></span> Signing in...</>
                            ) : (
                                <>Sign In →</>
                            )}
                        </button>
                    </form>
                    
                    <div className="auth-footer">
                        <div className="forgot-links">
                            <button 
                                onClick={() => { setShowForgotModal(true); setForgotType('password'); }}
                                className="link-button"
                            >
                                Forgot password?
                            </button>
                            <span className="separator">•</span>
                            <button 
                                onClick={() => { setShowForgotModal(true); setForgotType('username'); }}
                                className="link-button"
                            >
                                Forgot username?
                            </button>
                        </div>
                        <p className="signup-prompt">
                            Don't have an account? <Link to="/register">Join MyOmni</Link>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Forgot Modal */}
            {showForgotModal && (
                <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowForgotModal(false)}>×</button>
                        <h2>Forgot {forgotType === 'password' ? 'Password' : 'Username'}?</h2>
                        <p>Enter your email and we'll send you {forgotType === 'password' ? 'a reset link' : 'your username'}.</p>
                        
                        {forgotSuccess && <div className="alert alert-success">{forgotSuccess}</div>}
                        {error && <div className="alert alert-error">{error}</div>}
                        
                        <form onSubmit={handleForgot}>
                            <div className="form-group">
                                <input 
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary">
                                Send {forgotType === 'password' ? 'Reset Link' : 'Username'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Login;
