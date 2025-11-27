import React, { useState, useEffect } from 'react';
import { moviesAPI, cinemasAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const Home = () => {
    const [nowShowing, setNowShowing] = useState([]);
    const [comingSoon, setComingSoon] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [selectedCinema, setSelectedCinema] = useState('');
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadData();
    }, []);
    
    const loadData = async () => {
        try {
            const [nowRes, comingRes, cinemasRes] = await Promise.all([
                moviesAPI.getNowShowing(),
                moviesAPI.getComingSoon(),
                cinemasAPI.getAll(),
            ]);
            
            setNowShowing(Array.isArray(nowRes.data) ? nowRes.data : []);
            setComingSoon(Array.isArray(comingRes.data) ? comingRes.data : []);
            setCinemas(Array.isArray(cinemasRes.data) ? cinemasRes.data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setNowShowing([]);
            setComingSoon([]);
            setCinemas([]);
            setLoading(false);
        }
    };
    
    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    
    return (
        <div className="home">
            <section className="hero">
                <div className="hero-content">
                    <h1>Experience Cinema at its Best</h1>
                    <p>Book your tickets for the latest blockbusters</p>
                    <button 
                        className="btn-primary"
                        onClick={() => document.getElementById('now-showing')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Browse Movies
                    </button>
                </div>
            </section>
            
            <section className="cinema-selector">
                <div className="container">
                    <div className="selector-box">
                        <label htmlFor="cinema-select">Select Your Cinema:</label>
                        <select 
                            id="cinema-select"
                            value={selectedCinema}
                            onChange={(e) => setSelectedCinema(e.target.value)}
                        >
                            <option value="">All Locations</option>
                            {cinemas.map(cinema => (
                                <option key={cinema.id} value={cinema.id}>
                                    {cinema.name} - {cinema.location}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>
            
            <section className="movies-section" id="now-showing">
                <div className="container">
                    <h2>Now Showing</h2>
                    <div className="movie-grid">
                        {nowShowing.length === 0 ? (
                            <p>No movies currently showing.</p>
                        ) : (
                            nowShowing.map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))
                        )}
                    </div>
                </div>
            </section>
             
             <div className="section-divider"></div>
            
            <section className="omnipass-promo">
                <div className="container">
                    <div className="promo-content">
                        <h2>Get MyOmniPass</h2>
                        <p>See unlimited movies for just €19.99/month!</p>
                        <ul className="benefits-list">
                            <li>✓ Unlimited standard screenings</li>
                            <li>✓ 10% off concessions</li>
                            <li>✓ Priority booking</li>
                            <li>✓ No booking fees</li>
                        </ul>
                        <button className="btn-primary">Learn More</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;