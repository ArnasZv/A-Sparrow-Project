import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    return (
        <div className="movie-card">
            <Link to={`/movie/${movie.id}`}>
                <div className="movie-poster">
                    <img src={movie.poster_url} alt={movie.title} />
                    {movie.is_3d && <span className="badge-3d">3D</span>}
                    {movie.is_imax && <span className="badge-imax">MAXX</span>}
                </div>
                <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <div className="movie-meta">
                        <span className="rating">{movie.rating}</span>
                        <span className="duration">{movie.duration} min</span>
                    </div>
                    <p className="genre">{movie.genre}</p>
                </div>
            </Link>
            <button 
                className="btn-book"
                onClick={() => window.location.href = `/movie/${movie.id}`}
            >
                Book Now
            </button>
        </div>
    );
};

export default MovieCard;