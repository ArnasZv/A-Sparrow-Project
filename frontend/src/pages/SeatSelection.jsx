import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showtimesAPI, bookingsAPI } from '../services/api';
import SeatPicker from '../components/SeatPicker';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const SeatSelection = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showtime, setShowtime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: `/booking/seats/${showtimeId}` } });
            return;
        }
        loadShowtime();
    }, [showtimeId, user]);
    
    const loadShowtime = async () => {
        try {
            const response = await showtimesAPI.getById(showtimeId);
            setShowtime(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading showtime:', error);
            setLoading(false);
        }
    };
    
    const calculateTotal = () => {
        if (!showtime) return 0;
        
        let subtotal = 0;
        selectedSeats.forEach(seat => {
            let price = parseFloat(showtime.base_price);
            if (seat.seat_type === 'VIP') price *= 1.5;
            else if (seat.seat_type === 'RECLINE') price *= 1.3;
            subtotal += price;
        });
        
        return subtotal;
    };
    
    const handleContinue = async () => {
        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }
        
        try {
            const seatIds = selectedSeats.map(seat => seat.id);
            const response = await bookingsAPI.create({
                showtime_id: parseInt(showtimeId),
                seat_ids: seatIds
            });
            
            navigate(`/booking/checkout/${response.data.id}`);
        } catch (error) {
            console.error('Booking error:', error);
            alert(error.response?.data?.error || 'Failed to create booking. Please try again.');
        }
    };
    
    if (loading || !showtime) {
        return <div className="loading">Loading...</div>;
    }
    
    const subtotal = calculateTotal();
    const bookingFee = 1.00;
    const total = subtotal + bookingFee;
    
    return (
        <section className="seat-selection-page">
            <div className="container">
                <div className="selection-header">
                    <h1>Select Your Seats</h1>
                    <div className="showtime-summary">
                        <p><strong>{showtime.movie.title}</strong></p>
                        <p>{format(new Date(showtime.start_time), 'EEEE, MMMM d, yyyy - h:mm a')}</p>
                        <p>{showtime.screen.cinema.name} - {showtime.screen.name}</p>
                        <p className="price-info">Base Price: €{showtime.base_price}</p>
                    </div>
                </div>
                
                <SeatPicker 
                    showtimeId={showtimeId}
                    onSeatsSelected={setSelectedSeats}
                    basePrice={parseFloat(showtime.base_price)}
                />
                
                <div className="booking-summary">
                    <h3>Booking Summary</h3>
                    <div id="selected-seats-list">
                        {selectedSeats.length === 0 ? (
                            <p>No seats selected</p>
                        ) : (
                            <ul>
                                {selectedSeats.map(seat => {
                                    let price = parseFloat(showtime.base_price);
                                    if (seat.seat_type === 'VIP') price *= 1.5;
                                    else if (seat.seat_type === 'RECLINE') price *= 1.3;
                                    
                                    return (
                                        <li key={seat.id}>
                                            {seat.row}{seat.number} - €{price.toFixed(2)}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                    <div className="summary-item">
                        <span>Number of Seats:</span>
                        <span>{selectedSeats.length}</span>
                    </div>
                    <div className="summary-item">
                        <span>Subtotal:</span>
                        <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                        <span>Booking Fee:</span>
                        <span>€{bookingFee.toFixed(2)}</span>
                    </div>
                    <div className="summary-item summary-total">
                        <span>Total:</span>
                        <span>€{total.toFixed(2)}</span>
                    </div>
                    
                    <button 
                        className="btn-primary"
                        disabled={selectedSeats.length === 0}
                        onClick={handleContinue}
                    >
                        Continue to Payment
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SeatSelection;