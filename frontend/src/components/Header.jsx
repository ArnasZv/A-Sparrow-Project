import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    return (
        <header className="main-header">
            <div className="container">
                <nav className="navbar">
                    <div className="logo">
                        <Link to="/">
                            <h1>OMNIWATCH</h1>
                        </Link>
                    </div>
                    <ul className="nav-menu">
                        <li><Link to="/">Movies</Link></li>
                        <li><Link to="/cinemas">Cinemas</Link></li>
                        <li><Link to="/omnipass">MyOmniPass</Link></li>
                        {user ? (
                            <>
                                <li><Link to="/dashboard">Dashboard</Link></li>
                                <li><Link to="/profile">{user.username}</Link></li>
                                <li>
                                    <button onClick={handleLogout} className="btn-link">
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/login" className="btn-login">Sign In</Link></li>
                                <li><Link to="/register" className="btn-register">Join MyOmni</Link></li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;