import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { bookingsAPI } from '../services/api';
import { format } from 'date-fns';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ booking, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }
        
        setProcessing(true);
        setError(null);
        
        try {
            const cardElement = elements.getElement(CardElement);
            
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });
            
            if (stripeError) {
                setError(stripeError.message);
                setProcessing(false);
                return;
            }
            
            // Process payment through backend
            const response = await bookingsAPI.processPayment(booking.id, {
                payment_method_id: paymentMethod.id
            });
            
            if (response.data.success) {
                onSuccess(booking.id);
            } else {
                setError(response.data.error || 'Payment failed');
                setProcessing(false);
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.response?.data?.error || 'Payment failed. Please try again.');
            setProcessing(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <div className="payment-section">
                <h3>Payment Details</h3>
                <div className="card-element-wrapper">
                    <CardElement 
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#ffffff',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#fa755a',
                                },
                            },
                        }}
                    />
                </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
                <label>
                    <input type="checkbox" required />
                    I agree to the <a href="/terms" target="_blank">Terms & Conditions</a>
                </label>
            </div>
            
            <button 
                type="submit" 
                className="btn-primary"
                disabled={!stripe || processing}
            >
                {processing ? 'Processing...' : `Pay €${booking.total_amount}`}
            </button>
        </form>
    );
};

const Checkout = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadBooking();
    }, [bookingId]);
    
    const loadBooking = async () => {
        try {
            const response = await bookingsAPI.getById(bookingId);
            setBooking(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading booking:', error);
            setLoading(false);
        }
    };
    
    const handleSuccess = (bookingId) => {
        navigate(`/booking/confirmation/${bookingId}`);
    };
    
    if (loading || !booking) {
        return <div className="loading">Loading...</div>;
    }
    
    return (
        <section className="checkout-page">
            <div className="container">
                <h1>Complete Your Booking</h1>
                
                <div className="checkout-content">
                    <div className="booking-details">
                        <h2>Booking Details</h2>
                        <div className="detail-item">
                            <span className="label">Booking Reference:</span>
                            <span className="value">{booking.booking_reference}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Movie:</span>
                            <span className="value">{booking.showtime.movie.title}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Cinema:</span>
                            <span className="value">{booking.showtime.screen.cinema.name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Screen:</span>
                            <span className="value">{booking.showtime.screen.name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Date & Time:</span>
                            <span className="value">
                                {format(new Date(booking.showtime.start_time), 'EEEE, MMMM d, yyyy - h:mm a')}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Seats:</span>
                            <span className="value">
                                {booking.booked_seats.map(bs => 
                                    `${bs.seat.row}${bs.seat.number}`
                                ).join(', ')}
                            </span>
                        </div>
                        <div className="detail-item total">
                            <span className="label">Total Amount:</span>
                            <span className="value">€{booking.total_amount}</span>
                        </div>
                    </div>
                    
                    <div className="payment-form-wrapper">
                        <Elements stripe={stripePromise}>
                            <CheckoutForm booking={booking} onSuccess={handleSuccess} />
                        </Elements>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Checkout;