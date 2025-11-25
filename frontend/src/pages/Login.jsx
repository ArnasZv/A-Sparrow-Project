import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from || '/';
    
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
    
    return (
        <section className="auth-page">
            <div className="container">
                <div className="auth-box">
                    <h1>Sign In</h1>
                    <p className="subtitle">Welcome back to Omniplex</p>
                    
                    {error && <div className="alert alert-error">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="username">Email or Username</label>
                            <input 
                                type="text" 
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input 
                                type="password" 
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                        
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    
                    <div className="auth-footer">
                        <p><Link to="/forgot-password">Forgot password?</Link></p>
                        <p>Don't have an account? <Link to="/register">Join MyOmni</Link></p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;