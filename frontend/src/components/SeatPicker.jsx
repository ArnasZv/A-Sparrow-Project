import React, { useState, useEffect } from 'react';
import { showtimesAPI } from '../services/api';

const SeatPicker = ({ showtimeId, onSeatsSelected, basePrice }) => {
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadSeats();
    }, [showtimeId]);
    
    const loadSeats = async () => {
        try {
            const response = await showtimesAPI.getSeats(showtimeId);
            setSeats(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading seats:', error);
            setLoading(false);
        }
    };
    
    const toggleSeat = (seat) => {
        if (!seat.is_available) return;
        
        const isSelected = selectedSeats.some(s => s.id === seat.id);
        
        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };
    
    useEffect(() => {
        onSeatsSelected(selectedSeats);
    }, [selectedSeats]);
    
    const getSeatPrice = (seat) => {
        let price = basePrice;
        if (seat.seat_type === 'VIP') price *= 1.5;
        else if (seat.seat_type === 'RECLINE') price *= 1.3;
        return price;
    };
    
    const getSeatClass = (seat) => {
        let classes = ['seat', seat.seat_type];
        
        if (!seat.is_available) classes.push('unavailable');
        if (selectedSeats.some(s => s.id === seat.id)) classes.push('selected');
        
        return classes.join(' ');
    };
    
    if (loading) {
        return <div className="loading">Loading seats...</div>;
    }
    
    // Group seats by row
    const rows = {};
    seats.forEach(seat => {
        if (!rows[seat.row]) rows[seat.row] = [];
        rows[seat.row].push(seat);
    });
    
    return (
        <div className="seat-picker">
            <div className="screen-label">SCREEN</div>
            <div className="seat-map">
                {Object.keys(rows).sort().map(row => (
                    <div key={row} className="seat-row">
                        <span className="row-label">{row}</span>
                        {rows[row].sort((a, b) => a.number - b.number).map(seat => (
                            <div
                                key={seat.id}
                                className={getSeatClass(seat)}
                                onClick={() => toggleSeat(seat)}
                                title={`${seat.row}${seat.number} - €${getSeatPrice(seat).toFixed(2)}`}
                            >
                                {seat.row}{seat.number}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="seat-legend">
                <div><span className="legend-available"></span> Available</div>
                <div><span className="legend-selected"></span> Selected</div>
                <div><span className="legend-unavailable"></span> Unavailable</div>
                <div><span className="legend-vip"></span> VIP (+50%)</div>
                <div><span className="legend-wheelchair"></span> Wheelchair</div>
            </div>
        </div>
    );
};

export default SeatPicker;