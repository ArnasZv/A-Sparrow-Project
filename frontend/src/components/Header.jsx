import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/');
    };
    
    const closeMenu = () => {
        setIsMenuOpen(false);
    };
    
    return (
        <header className="main-header">
            <div className="container">
                <nav className="navbar">
                    <div className="logo">
                        <Link to="/" onClick={closeMenu}>
                            <h1>OMNIWATCH</h1>
                        </Link>
                    </div>
                    
                    {/* Hamburger Button */}
                    <button 
                        className="menu-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                    
                    {/* Navigation Menu */}
                    <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                        <li><Link to="/" onClick={closeMenu}>Movies</Link></li>
                        <li><Link to="/cinemas" onClick={closeMenu}>Cinemas</Link></li>
                        <li><Link to="/omnipass" onClick={closeMenu}>MyOmniPass</Link></li>
                        {user ? (
                            <>
                                <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
                                <li><Link to="/profile" onClick={closeMenu}>{user.username}</Link></li>
                                <li>
                                    <button onClick={handleLogout} className="btn-link">
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login" className="btn-login" onClick={closeMenu}>Sign In</Link></li>
                                <li><Link to="/register" className="btn-register" onClick={closeMenu}>Join MyOmni</Link></li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;