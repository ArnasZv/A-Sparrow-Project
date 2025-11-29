import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        new_password: '',
        confirm_password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validatePassword = () => {
        if (formData.new_password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        if (formData.new_password !== formData.confirm_password) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validatePassword()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/users/password-reset-confirm/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid,
                    token,
                    new_password: formData.new_password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.message || 'Failed to reset password. The link may have expired.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        const password = formData.new_password;
        if (password.length === 0) return '';
        if (password.length < 6) return 'weak';
        if (password.length < 10) return 'medium';
        return 'strong';
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Create New Password</h1>
                        <p>Enter your new password below</p>
                    </div>

                    {success ? (
                        <div className="success-message-box">
                            <div className="success-icon">✓</div>
                            <h3>Password Reset Successful!</h3>
                            <p>Your password has been reset successfully.</p>
                            <p className="success-note">
                                Redirecting to login page...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="auth-form">
                            {error && (
                                <div className="error-message">
                                    <span className="error-icon">⚠️</span>
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="new_password">New Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="new_password"
                                        name="new_password"
                                        className="form-input"
                                        placeholder="Enter new password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {formData.new_password && (
                                    <div className={`password-strength ${passwordStrength}`}>
                                        <div className="strength-bar">
                                            <div className="strength-fill"></div>
                                        </div>
                                        <span className="strength-text">
                                            {passwordStrength === 'weak' && 'Weak password'}
                                            {passwordStrength === 'medium' && 'Medium strength'}
                                            {passwordStrength === 'strong' && 'Strong password'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirm_password">Confirm Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirm_password"
                                        name="confirm_password"
                                        className="form-input"
                                        placeholder="Confirm new password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {formData.confirm_password && formData.new_password === formData.confirm_password && (
                                    <div className="password-match-indicator">
                                        ✓ Passwords match
                                    </div>
                                )}
                            </div>

                            <div className="password-requirements">
                                <p>Password must:</p>
                                <ul>
                                    <li className={formData.new_password.length >= 8 ? 'met' : ''}>
                                        Be at least 8 characters long
                                    </li>
                                    <li className={formData.new_password === formData.confirm_password && formData.new_password ? 'met' : ''}>
                                        Match the confirmation
                                    </li>
                                </ul>
                            </div>

                            <button 
                                type="submit" 
                                className="auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Resetting Password...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>

                            <div className="auth-footer">
                                <Link to="/login" className="auth-link">
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>

                <div className="auth-info">
                    <h2>Creating a Strong Password</h2>
                    <p>Follow these tips to create a secure password:</p>
                    <ul className="info-list">
                        <li>✓ Use at least 8 characters</li>
                        <li>✓ Mix uppercase and lowercase letters</li>
                        <li>✓ Include numbers and symbols</li>
                        <li>✓ Avoid common words or patterns</li>
                        <li>✓ Don't reuse passwords from other sites</li>
                    </ul>
                    <p className="security-note">
                        🔒 Your password is encrypted and stored securely
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;