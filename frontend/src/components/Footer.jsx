import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="container">
                {/* Optional Newsletter Section */}
                <div className="footer-newsletter">
                    <h3>Stay Updated 📬</h3>
                    <p>Subscribe to get the latest movie releases and exclusive offers!</p>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Enter your email" />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>

                <div className="footer-content">
                    <div className="footer-section">
                        <h3>About Omniplex</h3>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                            <li><Link to="/careers">Careers</Link></li>
                            <li><Link to="/press">Press Room</Link></li>
                        </ul>
                    </div>
                    
                    <div className="footer-section">
                        <h3>Support</h3>
                        <ul>
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/accessibility">Accessibility</Link></li>
                        </ul>
                    </div>
                    
                    <div className="footer-section">
                        <h3>Experience</h3>
                        <ul>
                            <li><Link to="/omnipass">MyOmniPass</Link></li>
                            <li><Link to="/gift-cards">Gift Cards</Link></li>
                            <li><Link to="/group-bookings">Group Bookings</Link></li>
                            <li><Link to="/kids-club">Kids Club</Link></li>
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
                    <p>&copy; 2024 Omniplex Cinema. All rights reserved. Made with ❤️ for movie lovers.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;