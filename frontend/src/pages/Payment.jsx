import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe('pk_test_51SWmU22MSNu1lWenk7tfZX7GbFzQigJodkNEq6bjf6caG2tkVVnIcMv45B76MDQz4G219w0ew0eJrRnAjyVvYTWE00d0Xi65uq');

// Stripe Elements styling to match our theme
const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#ffffff',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            fontSize: '16px',
            '::placeholder': {
                color: '#555',
            },
        },
        invalid: {
            color: '#ff4757',
            iconColor: '#ff4757',
        },
    },
};

function PaymentForm({ bookingData, membershipData }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    
    // Determine if this is a membership or booking payment
    const isMembership = membershipData !== null;
    const totalAmount = isMembership ? membershipData.price : bookingData.total;
    
    const [activeTab, setActiveTab] = useState('card'); // 'card', 'stripe', 'google-pay'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [promoCodeVisible, setPromoCodeVisible] = useState(false);
    
    // Custom card form state
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        email: '',
        billingAddress: '',
        city: '',
        postalCode: '',
        country: '',
        saveCard: false,
    });

    // Card brand detection
    const [cardBrand, setCardBrand] = useState('💳');

    const detectCardBrand = (number) => {
        const cleaned = number.replace(/\s/g, '');
        if (/^4/.test(cleaned)) return '💳 Visa';
        if (/^5[1-5]/.test(cleaned)) return '💳 Mastercard';
        if (/^3[47]/.test(cleaned)) return '💳 Amex';
        if (/^6(?:011|5)/.test(cleaned)) return '💳 Discover';
        return '💳';
    };

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted.slice(0, 19); // Max 16 digits + 3 spaces
    };

    const formatExpiryDate = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
    };

    const handleCardInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'cardNumber') {
            const formatted = formatCardNumber(value);
            setCardData({ ...cardData, cardNumber: formatted });
            setCardBrand(detectCardBrand(formatted));
        } else if (name === 'expiryDate') {
            const formatted = formatExpiryDate(value);
            setCardData({ ...cardData, expiryDate: formatted });
        } else if (name === 'cvv') {
            setCardData({ ...cardData, cvv: value.replace(/\D/g, '').slice(0, 4) });
        } else if (type === 'checkbox') {
            setCardData({ ...cardData, [name]: checked });
        } else {
            setCardData({ ...cardData, [name]: value });
        }
    };

    // Handle Custom Card Form Submission
    const handleCustomCardSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate form
        if (!cardData.cardNumber || !cardData.cardName || !cardData.expiryDate || !cardData.cvv) {
            setError('Please fill in all required card details');
            setLoading(false);
            return;
        }

        try {
            const endpoint = isMembership ? '/api/payment/membership' : '/api/payment/process';
            const payloadData = isMembership 
                ? {
                    ...cardData,
                    plan: membershipData.plan,
                    billingCycle: membershipData.billingCycle,
                    amount: membershipData.price,
                }
                : {
                    ...cardData,
                    bookingId: bookingData.id,
                    amount: bookingData.total,
                };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payloadData),
            });

            if (response.ok) {
                setSuccess(true);
                // Redirect based on payment type
                setTimeout(() => {
                    if (isMembership) {
                        navigate('/dashboard', { state: { membershipActivated: true } });
                    } else {
                        navigate(`/booking/confirmation/${bookingData.id}`);
                    }
                }, 1500);
            } else {
                const data = await response.json();
                setError(data.message || 'Payment failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Stripe Elements Submission
    const handleStripeSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardNumberElement);

        try {
            // Create payment method
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    email: cardData.email,
                },
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            const endpoint = isMembership ? '/api/payment/stripe-membership' : '/api/payment/stripe';
            const payloadData = isMembership 
                ? {
                    paymentMethodId: paymentMethod.id,
                    plan: membershipData.plan,
                    billingCycle: membershipData.billingCycle,
                    amount: membershipData.price,
                }
                : {
                    paymentMethodId: paymentMethod.id,
                    bookingId: bookingData.id,
                    amount: bookingData.total,
                };

            // Send payment method to your backend
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payloadData),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    if (isMembership) {
                        navigate('/dashboard', { state: { membershipActivated: true } });
                    } else {
                        navigate(`/booking/confirmation/${bookingData.id}`);
                    }
                }, 1500);
            } else {
                setError(result.message || 'Payment failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Google Pay
    const handleGooglePay = async () => {
        setLoading(true);
        setError('');

        try {
            // Initialize Google Pay
            const paymentDataRequest = {
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [{
                    type: 'CARD',
                    parameters: {
                        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                        allowedCardNetworks: ['MASTERCARD', 'VISA'],
                    },
                    tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: {
                            gateway: 'stripe',
                            'stripe:version': '2020-08-27',
                            'stripe:publishableKey': 'pk_test_YOUR_KEY',
                        },
                    },
                }],
                merchantInfo: {
                    merchantId: 'YOUR_MERCHANT_ID',
                    merchantName: 'OmniWatch Cinema',
                },
                transactionInfo: {
                    totalPriceStatus: 'FINAL',
                    totalPrice: totalAmount.toFixed(2),
                    currencyCode: 'EUR',
                    countryCode: 'IE',
                },
            };

            console.log('Google Pay payment initiated', paymentDataRequest);
            
            // Simulate success
            setSuccess(true);
            setTimeout(() => {
                if (isMembership) {
                    navigate('/dashboard', { state: { membershipActivated: true } });
                } else {
                    navigate(`/booking/confirmation/${bookingData.id}`);
                }
            }, 1500);
        } catch (err) {
            setError('Google Pay payment failed. Please try another method.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-page">
            <div className="payment-container">
                <div className="payment-header">
                    <h1>Complete Your Payment</h1>
                    <p>Secure checkout powered by Stripe</p>
                </div>

                <div className="payment-grid">
                    {/* Payment Methods Section */}
                    <div className="payment-methods-section">
                        <h2>Payment Method</h2>

                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                <span className="error-message-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="success-message">
                                <span>✓</span> Payment successful! Redirecting...
                            </div>
                        )}

                        {/* Payment Method Tabs */}
                        <div className="payment-method-tabs">
                            <div 
                                className={`payment-tab ${activeTab === 'card' ? 'active' : ''}`}
                                onClick={() => setActiveTab('card')}
                            >
                                <span className="payment-tab-icon">💳</span>
                                <span className="payment-tab-name">Credit Card</span>
                            </div>
                            <div 
                                className={`payment-tab ${activeTab === 'stripe' ? 'active' : ''}`}
                                onClick={() => setActiveTab('stripe')}
                            >
                                <span className="payment-tab-icon">🔒</span>
                                <span className="payment-tab-name">Stripe</span>
                            </div>
                            <div 
                                className={`payment-tab ${activeTab === 'google-pay' ? 'active' : ''}`}
                                onClick={() => setActiveTab('google-pay')}
                            >
                                <span className="payment-tab-icon">G</span>
                                <span className="payment-tab-name">Google Pay</span>
                            </div>
                        </div>

                        {/* Custom Card Form */}
                        <div className={`payment-tab-content ${activeTab === 'card' ? 'active' : ''}`}>
                            <form className="card-form" onSubmit={handleCustomCardSubmit}>
                                <div className="form-section-title">Card Information</div>

                                <div className="form-group card-number-group">
                                    <label>
                                        Card Number <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        className="form-input"
                                        placeholder="1234 5678 9012 3456"
                                        value={cardData.cardNumber}
                                        onChange={handleCardInputChange}
                                        maxLength="19"
                                    />
                                    <span className="card-brand-icon">{cardBrand}</span>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Cardholder Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="cardName"
                                        className="form-input"
                                        placeholder="John Doe"
                                        value={cardData.cardName}
                                        onChange={handleCardInputChange}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            Expiry Date <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            className="form-input"
                                            placeholder="MM/YY"
                                            value={cardData.expiryDate}
                                            onChange={handleCardInputChange}
                                            maxLength="5"
                                        />
                                    </div>

                                    <div className="form-group cvv-info">
                                        <label>
                                            CVV <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="cvv"
                                            className="form-input"
                                            placeholder="123"
                                            value={cardData.cvv}
                                            onChange={handleCardInputChange}
                                            maxLength="4"
                                        />
                                        <span className="cvv-tooltip" title="3-4 digit security code on the back of your card">?</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Email Address <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="john.doe@example.com"
                                        value={cardData.email}
                                        onChange={handleCardInputChange}
                                    />
                                </div>

                                <div className="billing-address">
                                    <div className="form-section-title">Billing Address</div>

                                    <div className="form-group">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            name="billingAddress"
                                            className="form-input"
                                            placeholder="123 Main Street"
                                            value={cardData.billingAddress}
                                            onChange={handleCardInputChange}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                className="form-input"
                                                placeholder="Dublin"
                                                value={cardData.city}
                                                onChange={handleCardInputChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Postal Code</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                className="form-input"
                                                placeholder="D02 XY45"
                                                value={cardData.postalCode}
                                                onChange={handleCardInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            className="form-input"
                                            placeholder="Ireland"
                                            value={cardData.country}
                                            onChange={handleCardInputChange}
                                        />
                                    </div>

                                    <div className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            name="saveCard"
                                            checked={cardData.saveCard}
                                            onChange={handleCardInputChange}
                                        />
                                        <label>Save card details for future purchases</label>
                                    </div>
                                </div>

                                <div className="security-badge">
                                    <span className="security-badge-icon">🔒</span>
                                    <span className="security-badge-text">Your payment information is secure and encrypted</span>
                                </div>
                            </form>
                        </div>

                        {/* Stripe Elements Form */}
                        <div className={`payment-tab-content ${activeTab === 'stripe' ? 'active' : ''}`}>
                            <form className="card-form" onSubmit={handleStripeSubmit}>
                                <div className="form-section-title">Card Information</div>

                                <div className="form-group">
                                    <label>Card Number <span className="required">*</span></label>
                                    <div className="stripe-element">
                                        <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Expiry Date <span className="required">*</span></label>
                                        <div className="stripe-element">
                                            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>CVC <span className="required">*</span></label>
                                        <div className="stripe-element">
                                            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email Address <span className="required">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="john.doe@example.com"
                                        value={cardData.email}
                                        onChange={handleCardInputChange}
                                    />
                                </div>

                                <div className="security-badge">
                                    <span className="security-badge-icon">🔒</span>
                                    <span className="security-badge-text">Powered by Stripe - Industry-leading security</span>
                                </div>
                            </form>
                        </div>

                        {/* Google Pay */}
                        <div className={`payment-tab-content ${activeTab === 'google-pay' ? 'active' : ''}`}>
                            <div className="google-pay-container">
                                <p style={{ color: '#b0b0b0', marginBottom: '20px' }}>
                                    Pay quickly and securely with Google Pay
                                </p>
                                <button 
                                    className="google-pay-button"
                                    onClick={handleGooglePay}
                                    disabled={loading}
                                >
                                    <span className="google-pay-icon">G</span>
                                    Pay with Google Pay
                                </button>
                                <div className="payment-divider">or pay with card</div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary - CONDITIONAL RENDERING */}
                    <div className="order-summary">
                        <h3>{isMembership ? 'Membership Summary' : 'Order Summary'}</h3>

                        {isMembership ? (
                            // MEMBERSHIP SUMMARY
                            <>
                                <div className="membership-summary-content">
                                    <div className="membership-tier-display">
                                        <div className="tier-icon-large">
                                            {membershipData.plan === 'Silver' && '🥈'}
                                            {membershipData.plan === 'Gold' && '🥇'}
                                            {membershipData.plan === 'Platinum' && '💎'}
                                        </div>
                                        <h4 className="tier-name-large">{membershipData.plan} Membership</h4>
                                        <p className="billing-cycle-info">
                                            {membershipData.billingCycle === 'monthly' ? 'Monthly Subscription' : 'Annual Subscription'}
                                        </p>
                                    </div>

                                    <div className="membership-benefits-preview">
                                        <p className="benefits-title">What's Included:</p>
                                        <ul className="benefits-preview-list">
                                            {membershipData.plan === 'Silver' && (
                                                <>
                                                    <li>✓ 10% discount on tickets</li>
                                                    <li>✓ 5% discount on concessions</li>
                                                    <li>✓ Early booking access</li>
                                                    <li>✓ No booking fees</li>
                                                </>
                                            )}
                                            {membershipData.plan === 'Gold' && (
                                                <>
                                                    <li>✓ 20% discount on tickets</li>
                                                    <li>✓ 10% discount on concessions</li>
                                                    <li>✓ 1 free guest ticket/month</li>
                                                    <li>✓ Free seat upgrades</li>
                                                </>
                                            )}
                                            {membershipData.plan === 'Platinum' && (
                                                <>
                                                    <li>✓ Unlimited movies (1/day)</li>
                                                    <li>✓ 25% discount on concessions</li>
                                                    <li>✓ 3 free guest tickets/month</li>
                                                    <li>✓ VIP lounge access</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>

                                    <div className="summary-item">
                                        <span className="summary-item-label">Membership Fee</span>
                                        <span className="summary-item-value">€{membershipData.price?.toFixed(2)}</span>
                                    </div>

                                    {membershipData.billingCycle === 'annual' && (
                                        <div className="savings-highlight">
                                            <span>💰</span>
                                            <span>You're saving 17% with annual billing!</span>
                                        </div>
                                    )}

                                    <div className="summary-total">
                                        <span className="summary-total-label">Total Due Today</span>
                                        <span className="summary-total-value">€{membershipData.price?.toFixed(2)}</span>
                                    </div>

                                    <div className="membership-note">
                                        <p>
                                            {membershipData.billingCycle === 'monthly' 
                                                ? 'Your membership will automatically renew monthly until cancelled.'
                                                : 'Your membership will automatically renew annually until cancelled.'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // BOOKING SUMMARY (ORIGINAL)
                            <>
                                <div className="summary-movie-info">
                                    <img 
                                        src={bookingData.moviePoster || '/placeholder.jpg'} 
                                        alt={bookingData.movieTitle}
                                        className="summary-poster"
                                    />
                                    <div className="summary-details">
                                        <h4>{bookingData.movieTitle}</h4>
                                        <p>{bookingData.cinema}</p>
                                        <p>{bookingData.dateTime}</p>
                                        <p>{bookingData.screen}</p>
                                    </div>
                                </div>

                                <div className="summary-seats">
                                    <p>Selected Seats:</p>
                                    <div className="summary-seats-list">
                                        {bookingData.seats?.join(', ')}
                                    </div>
                                </div>

                                <div className="summary-item">
                                    <span className="summary-item-label">Tickets ({bookingData.numSeats})</span>
                                    <span className="summary-item-value">€{bookingData.subtotal?.toFixed(2)}</span>
                                </div>

                                <div className="summary-item">
                                    <span className="summary-item-label">Booking Fee</span>
                                    <span className="summary-item-value">€{bookingData.bookingFee?.toFixed(2)}</span>
                                </div>

                                {bookingData.discount > 0 && (
                                    <div className="summary-item">
                                        <span className="summary-item-label">Discount</span>
                                        <span className="summary-item-value" style={{ color: '#28a745' }}>
                                            -€{bookingData.discount?.toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                <div className="promo-code-section">
                                    <button 
                                        className="promo-code-toggle"
                                        onClick={() => setPromoCodeVisible(!promoCodeVisible)}
                                    >
                                        <span>🎫</span>
                                        Have a promo code?
                                    </button>
                                    <div className={`promo-code-input ${promoCodeVisible ? 'show' : ''}`}>
                                        <input type="text" placeholder="Enter code" />
                                        <button>Apply</button>
                                    </div>
                                </div>

                                <div className="summary-total">
                                    <span className="summary-total-label">Total</span>
                                    <span className="summary-total-value">€{bookingData.total?.toFixed(2)}</span>
                                </div>
                            </>
                        )}

                        <button 
                            className="pay-button"
                            onClick={activeTab === 'card' ? handleCustomCardSubmit : activeTab === 'stripe' ? handleStripeSubmit : handleGooglePay}
                            disabled={loading || success}
                        >
                            <div className="pay-button-content">
                                {loading && <span className="spinner"></span>}
                                {loading ? 'Processing...' : `Pay €${totalAmount?.toFixed(2)}`}
                            </div>
                        </button>

                        <div className="payment-terms">
                            By completing this purchase, you agree to our{' '}
                            <a href="/terms">Terms & Conditions</a> and{' '}
                            <a href="/privacy">Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main Payment Component wrapped with Stripe Elements
export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Check if this is a membership or booking payment
    const isMembership = location.state?.type === 'membership';
    
    // Get membership data or booking data
    const membershipData = isMembership ? {
        plan: location.state?.plan || 'Silver',
        price: location.state?.price || 0,
        billingCycle: location.state?.billingCycle || 'monthly',
    } : null;
    
    // Get booking data from navigation state
    const bookingData = !isMembership ? (location.state?.bookingData || {
        // Fallback data if accessed directly
        id: 0,
        movieTitle: 'No booking selected',
        moviePoster: '/placeholder.jpg',
        cinema: 'Please select seats first',
        dateTime: '',
        screen: '',
        seats: [],
        numSeats: 0,
        subtotal: 0,
        bookingFee: 0,
        discount: 0,
        total: 0,
    }) : {
        id: 0,
        movieTitle: '',
        moviePoster: '',
        cinema: '',
        dateTime: '',
        screen: '',
        seats: [],
        numSeats: 0,
        subtotal: 0,
        bookingFee: 0,
        discount: 0,
        total: 0,
    };
    
    // Redirect to home if no data
    useEffect(() => {
        if (!isMembership && !location.state?.bookingData) {
            console.warn('No booking or membership data found');
            // Uncomment to enable redirect
            // navigate('/');
        }
    }, [location.state, navigate, isMembership]);

    return (
        <Elements stripe={stripePromise}>
            <PaymentForm bookingData={bookingData} membershipData={membershipData} />
        </Elements>
    );
}