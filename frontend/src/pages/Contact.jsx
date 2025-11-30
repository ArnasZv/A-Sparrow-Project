import React, { useState } from 'react';
import { contactAPI } from '../services/api';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Client-side validation
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            await contactAPI.submit(formData);
            
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            
            // Reset success message after 5 seconds
            setTimeout(() => {
                setSubmitted(false);
            }, 5000);
        } catch (err) {
            console.error('Contact form error:', err);
            setError(err.response?.data?.error || 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="info-page">
            <div className="info-page-header">
                <h1>Contact Us</h1>
                <p>We'd love to hear from you</p>
            </div>

            <div className="info-page-content">
                <div className="contact-grid">
                    <div className="contact-info">
                        <h2>Get in Touch</h2>
                        <p>
                            Have a question, suggestion, or feedback? Our team is here to help. 
                            Reach out to us using the form or contact information below.
                        </p>

                        <div className="contact-methods">
                            <div className="contact-method">
                                <h3>📧 Email</h3>
                                <p>General Inquiries: <a href="mailto:info@omniwatch.com">info@omniwatch.com</a></p>
                                <p>Customer Support: <a href="mailto:support@omniwatch.com">support@omniwatch.com</a></p>
                                <p>Group Bookings: <a href="mailto:groups@omniwatch.com">groups@omniwatch.com</a></p>
                            </div>

                            <div className="contact-method">
                                <h3>📞 Phone</h3>
                                <p>Main Line: +353 1 234 5678</p>
                                <p>Customer Support: 1800 OMNIWATCH</p>
                                <p>Hours: Mon-Fri 9:00 AM - 6:00 PM</p>
                            </div>

                            <div className="contact-method">
                                <h3>📍 Head Office</h3>
                                <p>OmniWatch Cinema Headquarters</p>
                                <p>123 Cinema Street</p>
                                <p>Dublin 2, Ireland</p>
                                <p>D02 XY45</p>
                            </div>

                            <div className="contact-method">
                                <h3>🕐 Customer Service Hours</h3>
                                <p>Monday - Friday: 9:00 AM - 9:00 PM</p>
                                <p>Saturday - Sunday: 10:00 AM - 8:00 PM</p>
                                <p>Bank Holidays: 10:00 AM - 6:00 PM</p>
                            </div>
                        </div>

                        <div className="social-media-contact">
                            <h3>Follow Us</h3>
                            <p>Stay connected on social media for updates, contests, and exclusive content!</p>
                            <div className="social-links-contact">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-wrapper">
                        <h2>Send Us a Message</h2>
                        
                        {submitted && (
                            <div className="success-message">
                                ✓ Thank you for your message! We'll get back to you soon. Check your email for confirmation.
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                ⚠️ {error}
                            </div>
                        )}

                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Your Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="john.doe@example.com"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject *</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select a subject</option>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Booking Issue">Booking Issue</option>
                                    <option value="Refund Request">Refund Request</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Feedback">Feedback</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    placeholder="Tell us how we can help..."
                                    disabled={loading}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="content-section">
                    <h2>Frequently Contacted Departments</h2>
                    <div className="departments-grid">
                        <div className="department">
                            <h3>Customer Support</h3>
                            <p>Booking issues, refunds, account help</p>
                            <p><strong>Email:</strong> support@omniwatch.com</p>
                        </div>
                        <div className="department">
                            <h3>Group Bookings</h3>
                            <p>Corporate events, school trips, parties</p>
                            <p><strong>Email:</strong> groups@omniwatch.com</p>
                        </div>
                        <div className="department">
                            <h3>Marketing & Partnerships</h3>
                            <p>Advertising, sponsorships, collaborations</p>
                            <p><strong>Email:</strong> marketing@omniwatch.com</p>
                        </div>
                        <div className="department">
                            <h3>Press & Media</h3>
                            <p>Media inquiries, press releases</p>
                            <p><strong>Email:</strong> press@omniwatch.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;