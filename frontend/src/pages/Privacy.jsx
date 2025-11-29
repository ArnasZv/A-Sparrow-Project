import React from 'react';

const Privacy = () => {
    return (
        <section className="info-page legal-page">
            <div className="info-page-header">
                <h1>Privacy Policy</h1>
                <p>Last Updated: November 29, 2025</p>
            </div>

            <div className="info-page-content">
                <div className="legal-intro">
                    <p>
                        At OmniWatch Cinema, we are committed to protecting your privacy and personal information. 
                        This Privacy Policy explains how we collect, use, store, and protect your data.
                    </p>
                </div>

                <div className="content-section">
                    <h2>1. Information We Collect</h2>
                    <h3>1.1 Information You Provide</h3>
                    <ul>
                        <li><strong>Account Information:</strong> Name, email address, password, phone number, date of birth</li>
                        <li><strong>Booking Information:</strong> Movie selections, showtime preferences, seat choices, payment details</li>
                        <li><strong>Payment Information:</strong> Credit/debit card details (processed securely through Stripe)</li>
                        <li><strong>Communication:</strong> Emails, messages, feedback you send us</li>
                    </ul>

                    <h3>1.2 Information Collected Automatically</h3>
                    <ul>
                        <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                        <li><strong>Usage Data:</strong> Pages visited, time spent, features used</li>
                        <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                    </ul>
                </div>

                <div className="content-section">
                    <h2>2. How We Use Your Information</h2>
                    <p>We use your personal information for the following purposes:</p>
                    <ul>
                        <li><strong>Service Delivery:</strong> Process bookings, send tickets, manage your account</li>
                        <li><strong>Communication:</strong> Send booking confirmations, updates, and promotional emails (with consent)</li>
                        <li><strong>Improvement:</strong> Analyze usage patterns to improve our services</li>
                        <li><strong>Security:</strong> Detect and prevent fraud, abuse, and technical issues</li>
                        <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
                        <li><strong>Personalization:</strong> Recommend movies and showtimes based on your preferences</li>
                    </ul>
                </div>

                <div className="content-section">
                    <h2>3. Data Sharing and Disclosure</h2>
                    <h3>3.1 We Share Your Information With:</h3>
                    <ul>
                        <li><strong>Payment Processors:</strong> Stripe (for secure payment processing)</li>
                        <li><strong>Email Services:</strong> For sending confirmations and notifications</li>
                        <li><strong>Analytics Providers:</strong> To understand usage patterns (anonymized data)</li>
                        <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                    </ul>

                    <h3>3.2 We Do NOT:</h3>
                    <ul>
                        <li>Sell your personal information to third parties</li>
                        <li>Share your data for third-party marketing without consent</li>
                        <li>Store full credit card details on our servers</li>
                    </ul>
                </div>

                <div className="content-section">
                    <h2>4. Your Rights and Choices</h2>
                    <p>Under GDPR and Irish data protection laws, you have the right to:</p>
                    <ul>
                        <li><strong>Access:</strong> Request a copy of your personal data</li>
                        <li><strong>Correction:</strong> Update incorrect or incomplete information</li>
                        <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
                        <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
                        <li><strong>Portability:</strong> Receive your data in a portable format</li>
                        <li><strong>Withdrawal:</strong> Withdraw consent for marketing communications at any time</li>
                    </ul>
                    <p>To exercise these rights, contact us at privacy@omniwatch.com</p>
                </div>

                <div className="content-section">
                    <h2>5. Data Security</h2>
                    <p>We implement industry-standard security measures including:</p>
                    <ul>
                        <li>SSL/TLS encryption for data transmission</li>
                        <li>Secure password hashing (PBKDF2 algorithm)</li>
                        <li>Regular security audits and updates</li>
                        <li>Limited employee access to personal data</li>
                        <li>Secure data centers with physical safeguards</li>
                    </ul>
                </div>

                <div className="content-section">
                    <h2>6. Data Retention</h2>
                    <p>
                        We retain your personal information for as long as necessary to provide our services 
                        and comply with legal obligations. Booking history is retained for 7 years for tax 
                        and accounting purposes. Account information is retained until you request deletion.
                    </p>
                </div>

                <div className="content-section">
                    <h2>7. Cookies Policy</h2>
                    <h3>Types of Cookies We Use:</h3>
                    <ul>
                        <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                        <li><strong>Performance Cookies:</strong> Help us understand how you use our site</li>
                        <li><strong>Functionality Cookies:</strong> Remember your preferences</li>
                    </ul>
                    <p>You can control cookies through your browser settings.</p>
                </div>

                <div className="content-section">
                    <h2>8. Children's Privacy</h2>
                    <p>
                        Our services are not directed to children under 13. We do not knowingly collect 
                        personal information from children under 13. If you believe we have collected 
                        information from a child under 13, please contact us immediately.
                    </p>
                </div>

                <div className="content-section">
                    <h2>9. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of 
                        significant changes via email or website notice. Your continued use of our services 
                        after changes indicates acceptance of the updated policy.
                    </p>
                </div>

                <div className="content-section">
                    <h2>10. Contact Us</h2>
                    <p>For questions about this Privacy Policy or to exercise your rights:</p>
                    <ul>
                        <li><strong>Email:</strong> privacy@omniwatch.com</li>
                        <li><strong>Data Protection Officer:</strong> dpo@omniwatch.com</li>
                        <li><strong>Mail:</strong> OmniWatch Cinema, Data Protection, 123 Cinema Street, Dublin 2, Ireland</li>
                    </ul>
                </div>

                <div className="legal-footer">
                    <p>
                        This Privacy Policy complies with the General Data Protection Regulation (GDPR) 
                        and Irish data protection laws.
                    </p>
                    <p><strong>Effective Date:</strong> November 29, 2025</p>
                </div>
            </div>
        </section>
    );
};

export default Privacy;