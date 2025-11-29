import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OmniPass = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'

    const membershipTiers = [
        {
            name: 'Silver',
            icon: '🥈',
            color: '#C0C0C0',
            monthlyPrice: 9.99,
            annualPrice: 99.99,
            description: 'Perfect for casual movie-goers',
            features: [
                '10% discount on all tickets',
                '5% discount on concessions',
                'Early booking access (24 hours)',
                'Birthday bonus: 1 free ticket',
                'No booking fees',
                'Member-only screenings'
            ],
            popular: false
        },
        {
            name: 'Gold',
            icon: '🥇',
            color: '#FFD700',
            monthlyPrice: 19.99,
            annualPrice: 199.99,
            description: 'For the dedicated cinema enthusiast',
            features: [
                '20% discount on all tickets',
                '10% discount on concessions',
                'Early booking access (48 hours)',
                'Birthday bonus: 2 free tickets',
                'No booking fees',
                'Member-only screenings',
                'Free seat upgrades (when available)',
                '1 free guest ticket per month',
                'Priority customer support'
            ],
            popular: true
        },
        {
            name: 'Platinum',
            icon: '💎',
            color: '#E5E4E2',
            monthlyPrice: 34.99,
            annualPrice: 349.99,
            description: 'The ultimate VIP cinema experience',
            features: [
                'Unlimited movies (up to 1 per day)',
                '25% discount on concessions',
                'Early booking access (72 hours)',
                'Birthday bonus: 4 free guest tickets',
                'No booking fees',
                'Member-only screenings',
                'Free seat upgrades to VIP',
                '3 free guest tickets per month',
                'Priority customer support',
                'Exclusive premiere invitations',
                'Free large popcorn monthly',
                'VIP lounge access'
            ],
            popular: false
        }
    ];

    const calculateSavings = (monthly, annual) => {
        const monthlyCost = monthly * 12;
        const savings = monthlyCost - annual;
        const percentage = Math.round((savings / monthlyCost) * 100);
        return { savings: savings.toFixed(2), percentage };
    };

    const handleSelectPlan = (tier) => {
        if (!user) {
            // Redirect to login if not authenticated
            navigate('/login', { state: { from: '/omnipass', plan: tier.name } });
        } else {
            // Redirect to payment with membership details
            navigate('/payment', { 
                state: { 
                    type: 'membership',
                    plan: tier.name,
                    price: billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice,
                    billingCycle: billingCycle
                } 
            });
        }
    };

    return (
        <div className="omnipass-page">
            {/* Hero Section */}
            <section className="omnipass-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="omni-gradient">OmniPass</span> Membership
                    </h1>
                    <p className="hero-subtitle">
                        Unlock unlimited entertainment and exclusive benefits
                    </p>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">50K+</span>
                            <span className="stat-label">Active Members</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">500K+</span>
                            <span className="stat-label">Movies Watched</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">$2M+</span>
                            <span className="stat-label">Saved by Members</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Billing Toggle */}
            <section className="billing-toggle-section">
                <div className="billing-toggle-container">
                    <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
                    <button 
                        className="billing-toggle"
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                        aria-label="Toggle billing cycle"
                    >
                        <span className={`toggle-slider ${billingCycle === 'annual' ? 'annual' : ''}`} />
                    </button>
                    <span className={billingCycle === 'annual' ? 'active' : ''}>
                        Annual <span className="save-badge">Save up to 17%</span>
                    </span>
                </div>
            </section>

            {/* Membership Tiers */}
            <section className="membership-tiers">
                <div className="tiers-grid">
                    {membershipTiers.map((tier, index) => {
                        const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
                        const savings = calculateSavings(tier.monthlyPrice, tier.annualPrice);
                        
                        return (
                            <div 
                                key={index} 
                                className={`membership-card ${tier.popular ? 'popular' : ''}`}
                                style={{ '--tier-color': tier.color }}
                            >
                                {tier.popular && <div className="popular-badge">Most Popular</div>}
                                
                                <div className="card-header">
                                    <div className="tier-icon">{tier.icon}</div>
                                    <h3 className="tier-name">{tier.name}</h3>
                                    <p className="tier-description">{tier.description}</p>
                                </div>

                                <div className="card-pricing">
                                    <div className="price">
                                        <span className="currency">$</span>
                                        <span className="amount">{price.toFixed(2)}</span>
                                        <span className="period">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                    </div>
                                    {billingCycle === 'annual' && (
                                        <div className="savings-info">
                                            Save ${savings.savings}/year ({savings.percentage}%)
                                        </div>
                                    )}
                                </div>

                                <div className="card-features">
                                    <ul className="features-list">
                                        {tier.features.map((feature, idx) => (
                                            <li key={idx}>
                                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button 
                                    className="select-plan-btn"
                                    onClick={() => handleSelectPlan(tier)}
                                >
                                    {user ? 'Choose Plan' : 'Sign Up & Choose Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Why Join Section */}
            <section className="why-join-section">
                <h2 className="section-title">Why Join OmniPass?</h2>
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <div className="benefit-icon">💰</div>
                        <h3>Save Money</h3>
                        <p>Members save an average of $400 per year on tickets and concessions</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">🎟️</div>
                        <h3>Skip the Lines</h3>
                        <p>Book early and reserve your favorite seats before anyone else</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">🌟</div>
                        <h3>Exclusive Perks</h3>
                        <p>Access member-only screenings and special premiere events</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">🎁</div>
                        <h3>Birthday Treats</h3>
                        <p>Celebrate your special day with free tickets and surprises</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <h2 className="section-title">Frequently Asked Questions</h2>
                <div className="faq-grid">
                    <div className="faq-item">
                        <h3>Can I cancel anytime?</h3>
                        <p>Yes! You can cancel your membership at any time. Your benefits will remain active until the end of your current billing period.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Can I upgrade or downgrade my plan?</h3>
                        <p>Absolutely! You can change your membership tier at any time from your account settings. Changes take effect at the start of your next billing cycle.</p>
                    </div>
                    <div className="faq-item">
                        <h3>How do I use my membership benefits?</h3>
                        <p>Simply log in to your account when booking tickets. Your discounts and perks will be automatically applied at checkout.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Can I share my membership with family?</h3>
                        <p>Memberships are personal and non-transferable. However, Gold and Platinum members receive free guest tickets each month!</p>
                    </div>
                    <div className="faq-item">
                        <h3>What happens to unused guest tickets?</h3>
                        <p>Guest tickets expire at the end of each month and do not roll over. Make sure to use them before they expire!</p>
                    </div>
                    <div className="faq-item">
                        <h3>Is there a commitment period?</h3>
                        <p>No long-term commitment required! Both monthly and annual plans can be cancelled anytime. Annual plans offer better value with no additional commitment.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Start Saving?</h2>
                    <p>Join thousands of movie lovers who are already enjoying exclusive benefits</p>
                    <button 
                        className="cta-button"
                        onClick={() => !user ? navigate('/register') : window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        {user ? 'Choose Your Plan' : 'Get Started Today'}
                    </button>
                    <p className="cta-note">No commitment required • Cancel anytime • 30-day money-back guarantee</p>
                </div>
            </section>
        </div>
    );
};

export default OmniPass;