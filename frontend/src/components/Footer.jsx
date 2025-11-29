import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="container">
            

                <div className="footer-content">
                    <div className="footer-section">
                        <h3>About Omniplex</h3>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>
                    
                    <div className="footer-section">
                        <h3>Support</h3>
                        <ul>
                            <li><Link to="/FAQ">FAQ</Link></li>
                            <li><Link to="/Terms">Terms & Conditions</Link></li>
                            <li><Link to="/Privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    
                    <div className="footer-section">
                        <h3>Experience</h3>
                        <ul>
                            <li><Link to="/omnipass">MyOmniPass</Link></li>
                            
                            <li><Link to="/gift-cards"className="link-disabled">Gift Cards<span className="maintenance-badge">X</span></Link></li>
                            <li><Link to="/group-bookings" className="link-disabled">Group Bookings<span className="maintenance-badge">X</span></Link></li>
                        </ul>
                    </div>
                    
                    <div className="footer-section">
                        <h3>Follow Us</h3>
                        <p style={{marginBottom: '15px', color: '#999'}}>Connect with us on social media</p>
                        <div className="social-links">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">𝕏</a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">📷</a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">▶</a>
                        </div>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <p>&copy; 2025 OmniWatch Cinema. All rights reserved. Made with ❤️ for movie lovers.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;