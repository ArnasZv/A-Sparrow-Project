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
    const [showSuccess, setShowSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
        
        // Check password strength
        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };
    
    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        setPasswordStrength(strength);
    };
    
    const getPasswordStrengthLabel = () => {
        const labels = ['Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#ff4444', '#ffaa00', '#88cc00', '#00cc44'];
        return {
            label: labels[passwordStrength - 1] || 'Too Short',
            color: colors[passwordStrength - 1] || '#666'
        };
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }
        
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (formData.password !== formData.password2) {
            newErrors.password2 = 'Passwords do not match';
        }
        
        if (!formData.first_name) {
            newErrors.first_name = 'First name is required';
        }
        
        if (!formData.last_name) {
            newErrors.last_name = 'Last name is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        const result = await register(formData);
        
        if (result.success) {
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } else {
            setErrors(result.error);
            setLoading(false);
        }
    };
    
    if (showSuccess) {
        return (
            <section className="auth-page">
                <div className="container">
                    <div className="auth-box success-box">
                        <div className="success-animation">
                            <div className="checkmark">✓</div>
                        </div>
                        <h1>Welcome to Omniplex! 🎉</h1>
                        <p>Your account has been created successfully!</p>
                        <p className="email-notice">📧 Check your email for a welcome message</p>
                        <div className="loading-redirect">
                            <div className="spinner"></div>
                            <p>Redirecting to your dashboard...</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
    
    return (
        <section className="auth-page">
            <div className="container">
                <div className="auth-box register-box">
                    <div className="auth-header">
                        <div className="auth-icon">🎬</div>
                        <h1>Join MyOmni</h1>
                        <p className="subtitle">Create your account and start booking amazing movies</p>
                    </div>
                    
                    {errors.non_field_errors && (
                        <div className="alert alert-error">{errors.non_field_errors}</div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="auth-form register-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="first_name">
                                    <span className="label-icon">👤</span>
                                    First Name
                                </label>
                                <input 
                                    type="text" 
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John"
                                />
                                {errors.first_name && <span className="error-text">{errors.first_name}</span>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="last_name">
                                    <span className="label-icon">👤</span>
                                    Last Name
                                </label>
                                <input 
                                    type="text" 
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Doe"
                                />
                                {errors.last_name && <span className="error-text">{errors.last_name}</span>}
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="username">
                                <span className="label-icon">@</span>
                                Username
                            </label>
                            <input 
                                type="text" 
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Choose a unique username"
                            />
                            {errors.username && <span className="error-text">{errors.username}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">
                                <span className="label-icon">📧</span>
                                Email
                            </label>
                            <input 
                                type="email" 
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your.email@example.com"
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password1">
                                <span className="label-icon">🔒</span>
                                Password
                            </label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    id="password1"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Create a strong password"
                                />
                                <button 
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div 
                                            className="strength-fill"
                                            style={{
                                                width: `${(passwordStrength / 4) * 100}%`,
                                                backgroundColor: getPasswordStrengthLabel().color
                                            }}
                                        ></div>
                                    </div>
                                    <span 
                                        className="strength-label"
                                        style={{ color: getPasswordStrengthLabel().color }}
                                    >
                                        {getPasswordStrengthLabel().label}
                                    </span>
                                </div>
                            )}
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password2">
                                <span className="label-icon">🔒</span>
                                Confirm Password
                            </label>
                            <input 
                                type={showPassword ? "text" : "password"}
                                id="password2"
                                name="password2"
                                value={formData.password2}
                                onChange={handleChange}
                                required
                                placeholder="Confirm your password"
                            />
                            {errors.password2 && <span className="error-text">{errors.password2}</span>}
                        </div>
                        
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input type="checkbox" required />
                                <span className="checkbox-text">
                                    I agree to the <Link to="/terms" target="_blank">Terms & Conditions</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>
                                </span>
                            </label>
                        </div>
                        
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input type="checkbox" name="receive_promotions" defaultChecked />
                                <span className="checkbox-text">
                                    📬 Send me promotional emails about new movies and exclusive offers
                                </span>
                            </label>
                        </div>
                        
                        <button type="submit" className="btn-primary btn-auth" disabled={loading}>
                            {loading ? (
                                <><span className="spinner"></span> Creating Account...</>
                            ) : (
                                <>Create Account →</>
                            )}
                        </button>
                    </form>
                    
                    <div className="auth-footer">
                        <p className="signup-prompt">
                            Already have an account? <Link to="/login">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;