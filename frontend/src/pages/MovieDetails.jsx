import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesAPI, cinemasAPI } from '../services/api';
import { format } from 'date-fns';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedCinema, setSelectedCinema] = useState('');
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadMovieDetails();
        loadCinemas();
    }, [id]);
    
    useEffect(() => {
        if (movie) {
            loadShowtimes();
        }
    }, [selectedDate, selectedCinema, movie]);
    
    const loadMovieDetails = async () => {
        try {
            const response = await moviesAPI.getById(id);
            setMovie(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading movie:', error);
            setLoading(false);
        }
    };
    
    const loadCinemas = async () => {
        try {
            const response = await cinemasAPI.getAll();
            setCinemas(response.data);
        } catch (error) {
            console.error('Error loading cinemas:', error);
        }
    };
    
    const loadShowtimes = async () => {
        try {
            const response = await moviesAPI.getShowtimes(id, {
                date: selectedDate,
                cinema: selectedCinema
            });
            setShowtimes(response.data);
        } catch (error) {
            console.error('Error loading showtimes:', error);
        }
    };
    
    const handleBooking = (showtimeId) => {
        navigate(`/booking/seats/${showtimeId}`);
    };
    
    if (loading || !movie) {
        return <div className="loading">Loading...</div>;
    }
    
    return (
        <div className="movie-details">
            {/* Movie Banner */}
            <section 
                className="movie-banner" 
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${movie.banner_url || movie.poster_url})`
                }}
            >
                <div className="container">
                    <div className="movie-header">
                        <img src={movie.poster_url} alt={movie.title} className="detail-poster" />
                        <div className="movie-info-detail">
                            <h1>{movie.title}</h1>
                            <div className="movie-meta-detail">
                                <span className="rating-badge">{movie.rating}</span>
                                <span>{movie.duration} min</span>
                                <span>{movie.genre}</span>
                                {movie.is_3d && <span className="badge-3d">3D</span>}
                                {movie.is_imax && <span className="badge-imax">MAXX</span>}
                            </div>
                            <p className="description">{movie.description}</p>
                            <div className="movie-credits">
                                <p><strong>Director:</strong> {movie.director}</p>
                                <p><strong>Cast:</strong> {movie.cast}</p>
                            </div>
                            {movie.trailer_url && (
                                <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer">
                                    <button className="btn-secondary">▶ Watch Trailer</button>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Showtimes Section */}
            <section className="showtimes-section">
                <div className="container">
                    <h2>Select Showtime</h2>
                    
                    <div className="showtime-filters">
                        <div className="filter-group">
                            <label htmlFor="date-select">Date:</label>
                            <input 
                                type="date" 
                                id="date-select"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={format(new Date(), 'yyyy-MM-dd')}
                            />
                        </div>
                        <div className="filter-group">
                            <label htmlFor="cinema-filter">Cinema:</label>
                            <select 
                                id="cinema-filter"
                                value={selectedCinema}
                                onChange={(e) => setSelectedCinema(e.target.value)}
                            >
                                <option value="">All Cinemas</option>
                                {cinemas.map(cinema => (
                                    <option key={cinema.id} value={cinema.id}>
                                        {cinema.name} - {cinema.location}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="showtimes-grid">
                        {showtimes.length === 0 ? (
                            <p className="no-showtimes">No showtimes available for selected date and cinema.</p>
                        ) : (
                            showtimes.map(showtime => (
                                <div key={showtime.id} className="showtime-card">
                                    <div className="showtime-info">
                                        <span className="time">
                                            {format(new Date(showtime.start_time), 'HH:mm')}
                                        </span>
                                        <span className="cinema">{showtime.cinema_name}</span>
                                        <span className="screen">{showtime.screen_name}</span>
                                        <span className="seats-left">{showtime.available_seats} seats left</span>
                                    </div>
                                    <button 
                                        className="btn-primary"
                                        onClick={() => handleBooking(showtime.id)}
                                        disabled={showtime.available_seats === 0}
                                    >
                                        Book €{showtime.base_price}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MovieDetails;