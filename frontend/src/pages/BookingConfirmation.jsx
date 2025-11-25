import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import { format } from 'date-fns';

const BookingConfirmation = () => {
    const { bookingId } = useParams();
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
    
    const handlePrint = () => {
        window.print();
    };
    
    if (loading || !booking) {
        return <div className="loading">Loading...</div>;
    }
    
    return (
        <div className="confirmation-page">
            <div className="container">
                <div className="confirmation-card">
                    <div className="confirmation-header">
                        <div className="success-icon">✓</div>
                        <h1>Booking Confirmed!</h1>
                        <p>Your tickets have been successfully booked</p>
                    </div>
                    
                    <div className="ticket">
                        <div className="ticket-header">
                            <h2>E-Ticket</h2>
                            <p className="booking-ref">Booking Ref: {booking.booking_reference}</p>
                        </div>
                        
                        <div className="ticket-body">
                            <div className="movie-section">
                                <img 
                                    src={booking.showtime.movie.poster_url} 
                                    alt={booking.showtime.movie.title}
                                    className="ticket-poster"
                                />
                                <div className="movie-details">
                                    <h3>{booking.showtime.movie.title}</h3>
                                    <p className="movie-rating">{booking.showtime.movie.rating}</p>
                                </div>
                            </div>
                            
                            <div className="ticket-details">
                                <div className="detail-row">
                                    <span className="label">Cinema:</span>
                                    <span className="value">{booking.showtime.screen.cinema.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Screen:</span>
                                    <span className="value">{booking.showtime.screen.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Date:</span>
                                    <span className="value">
                                        {format(new Date(booking.showtime.start_time), 'EEEE, MMMM d, yyyy')}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Time:</span>
                                    <span className="value">
                                        {format(new Date(booking.showtime.start_time), 'h:mm a')}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Seats:</span>
                                    <span className="value seats">
                                        {booking.booked_seats.map(bs => 
                                            `${bs.seat.row}${bs.seat.number}`
                                        ).join(', ')}
                                    </span>
                                </div>
                                <div className="detail-row total">
                                    <span className="label">Total Paid:</span>
                                    <span className="value">€{booking.total_amount}</span>
                                </div>
                            </div>
                            
                            <div className="qr-section">
                                <div className="qr-code">
                                    <p>QR CODE</p>
                                    <p className="qr-text">{booking.booking_reference}</p>
                                </div>
                                <p className="qr-instruction">Show this QR code at the cinema entrance</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="confirmation-actions">
                        <button onClick={handlePrint} className="btn-secondary">
                            🖨️ Print Ticket
                        </button>
                        <Link to="/dashboard" className="btn-primary">
                            Go to Dashboard
                        </Link>
                        <Link to="/" className="btn-secondary">
                            Browse More Movies
                        </Link>
                    </div>
                    
                    <div className="important-info">
                        <h3>Important Information</h3>
                        <ul>
                            <li>Please arrive at least 15 minutes before showtime</li>
                            <li>Present this e-ticket at the cinema entrance</li>
                            <li>Cancellations must be made at least 2 hours before showtime</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;