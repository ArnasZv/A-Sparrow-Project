import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        
        const result = await register(formData);
        
        if (result.success) {
            navigate('/');
        } else {
            setErrors(result.error);
            setLoading(false);
        }
    };
    
    return (
        <section className="auth-page">
            <div className="container">
                <div className="auth-box">
                    <h1>Join MyOmni</h1>
                    <p className="subtitle">Create your account and start booking</p>
                    
                    {errors.non_field_errors && (
                        <div className="alert alert-error">{errors.non_field_errors}</div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input 
                                type="text" 
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required 
                            />
                            {errors.username && <span className="error">{errors.username}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required 
                            />
                            {errors.email && <span className="error">{errors.email}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="first_name">First Name</label>
                            <input 
                                type="text" 
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="last_name">Last Name</label>
                            <input 
                                type="text" 
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input 
                                type="password" 
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required 
                            />
                            {errors.password && <span className="error">{errors.password}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password2">Confirm Password</label>
                            <input 
                                type="password" 
                                id="password2"
                                name="password2"
                                value={formData.password2}
                                onChange={handleChange}
                                required 
                            />
                            {errors.password2 && <span className="error">{errors.password2}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label>
                                <input type="checkbox" required />
                                I agree to the <Link to="/terms" target="_blank">Terms & Conditions</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>
                            </label>
                        </div>
                        
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                    
                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Sign In</Link></p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;