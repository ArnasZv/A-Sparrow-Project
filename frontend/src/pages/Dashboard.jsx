import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI, moviesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast, isFuture } from 'date-fns';

const Dashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({
        totalBookings: 0,
        upcomingBookings: 0,
        pastBookings: 0,
        totalSpent: 0
    });
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    
    useEffect(() => {
        loadDashboardData();
    }, []);
    
    const loadDashboardData = async () => {
        try {
            const bookingsResponse = await bookingsAPI.getMyBookings();
            const bookingsData = bookingsResponse.data.results || bookingsResponse.data;
            
            setBookings(bookingsData);
            calculateStats(bookingsData);
            
            const moviesResponse = await moviesAPI.getNowShowing();
            setRecommendedMovies(moviesResponse.data.slice(0, 4));
            
            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            setLoading(false);
        }
    };
    
    const calculateStats = (bookingsData) => {
        const now = new Date();
        const upcoming = bookingsData.filter(b => 
            isFuture(new Date(b.showtime.start_time)) && b.status === 'CONFIRMED'
        );
        const past = bookingsData.filter(b => 
            isPast(new Date(b.showtime.start_time))
        );
        const totalSpent = bookingsData
            .filter(b => b.status === 'CONFIRMED')
            .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
        
        setStats({
            totalBookings: bookingsData.length,
            upcomingBookings: upcoming.length,
            pastBookings: past.length,
            totalSpent: totalSpent
        });
    };
    
    const getFilteredBookings = () => {
        const now = new Date();
        switch (activeTab) {
            case 'upcoming':
                return bookings.filter(b => 
                    isFuture(new Date(b.showtime.start_time)) && b.status === 'CONFIRMED'
                );
            case 'past':
                return bookings.filter(b => isPast(new Date(b.showtime.start_time)));
            case 'all':
            default:
                return bookings;
        }
    };
    
    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }
        
        try {
            await bookingsAPI.cancel(bookingId);
            loadDashboardData();
            alert('Booking cancelled successfully');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to cancel booking');
        }
    };
    
    const getStatusBadge = (status) => {
        const statusClasses = {
            'CONFIRMED': 'status-confirmed',
            'PENDING': 'status-pending',
            'CANCELLED': 'status-cancelled',
            'REFUNDED': 'status-refunded'
        };
        
        return <span className={`status-badge ${statusClasses[status]}`}>{status}</span>;
    };
    
    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }
    
    return (
        <div className="dashboard-page">
            <div className="container">
                <section className="dashboard-header">
                    <h1>Welcome back, {user?.first_name || user?.username}! 🎬</h1>
                    <p>Here's your cinema activity at a glance</p>
                </section>
                
                <section className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🎟️</div>
                        <div className="stat-info">
                            <h3>{stats.totalBookings}</h3>
                            <p>Total Bookings</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <h3>{stats.upcomingBookings}</h3>
                            <p>Upcoming Shows</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>{stats.pastBookings}</h3>
                            <p>Movies Watched</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3>€{stats.totalSpent.toFixed(2)}</h3>
                            <p>Total Spent</p>
                        </div>
                    </div>
                </section>
                
                <section className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <Link to="/" className="action-card">
                            <span className="action-icon">🎬</span>
                            <h3>Browse Movies</h3>
                            <p>Find your next movie to watch</p>
                        </Link>
                        
                        <Link to="/profile" className="action-card">
                            <span className="action-icon">👤</span>
                            <h3>Edit Profile</h3>
                            <p>Update your information</p>
                        </Link>
                    </div>
                </section>
                
                <section className="bookings-section">
                    <div className="section-header">
                        <h2>My Bookings</h2>
                        <div className="tabs">
                            <button 
                                className={activeTab === 'upcoming' ? 'tab active' : 'tab'}
                                onClick={() => setActiveTab('upcoming')}
                            >
                                Upcoming ({stats.upcomingBookings})
                            </button>
                            <button 
                                className={activeTab === 'past' ? 'tab active' : 'tab'}
                                onClick={() => setActiveTab('past')}
                            >
                                Past ({stats.pastBookings})
                            </button>
                            <button 
                                className={activeTab === 'all' ? 'tab active' : 'tab'}
                                onClick={() => setActiveTab('all')}
                            >
                                All ({stats.totalBookings})
                            </button>
                        </div>
                    </div>
                    
                    <div className="bookings-list">
                        {getFilteredBookings().length === 0 ? (
                            <div className="no-bookings">
                                <p>No bookings found</p>
                                <Link to="/" className="btn-primary">Browse Movies</Link>
                            </div>
                        ) : (
                            getFilteredBookings().map(booking => (
                                <div key={booking.id} className="booking-card">
                                    <div className="booking-poster">
                                        <img 
                                            src={booking.showtime.movie.poster_url} 
                                            alt={booking.showtime.movie.title} 
                                        />
                                    </div>
                                    
                                    <div className="booking-details">
                                        <h3>{booking.showtime.movie.title}</h3>
                                        <p className="booking-cinema">
                                            {booking.showtime.screen.cinema.name}
                                        </p>
                                        <p className="booking-datetime">
                                            📅 {format(new Date(booking.showtime.start_time), 'EEEE, MMMM d, yyyy')}
                                            <br />
                                            🕐 {format(new Date(booking.showtime.start_time), 'h:mm a')}
                                        </p>
                                        <p className="booking-seats">
                                            🪑 Seats: {booking.booked_seats.map(bs => 
                                                `${bs.seat.row}${bs.seat.number}`
                                            ).join(', ')}
                                        </p>
                                    </div>
                                    
                                    <div className="booking-actions">
                                        <div className="booking-meta">
                                            {getStatusBadge(booking.status)}
                                            <p className="booking-reference">Ref: {booking.booking_reference}</p>
                                            <p className="booking-amount">€{booking.total_amount}</p>
                                        </div>
                                        
                                        {booking.status === 'CONFIRMED' && 
                                         isFuture(new Date(booking.showtime.start_time)) && (
                                            <div className="action-buttons">
                                                <Link 
                                                    to={`/booking/confirmation/${booking.id}`}
                                                    className="btn-secondary btn-sm"
                                                >
                                                    View Ticket
                                                </Link>
                                                <button 
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="btn-danger btn-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
                
                <section className="recommended-section">
                    <h2>Recommended For You</h2>
                    <div className="movie-grid-small">
                        {recommendedMovies.map(movie => (
                            <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card-small">
                                <img src={movie.poster_url} alt={movie.title} />
                                <div className="movie-info-small">
                                    <h4>{movie.title}</h4>
                                    <p>{movie.genre}</p>
                                    <button className="btn-primary btn-sm">Book Now</button>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;