import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingConfirmation from './pages/BookingConfirmation';

import './App.css';

function App() {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Header />
                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/movie/:id" element={<MovieDetails />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            
                            {/* Protected Routes */}
                            <Route 
                                path="/dashboard" 
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/booking/seats/:showtimeId" 
                                element={
                                    <ProtectedRoute>
                                        <SeatSelection />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/booking/checkout/:bookingId" 
                                element={
                                    <ProtectedRoute>
                                        <Checkout />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/booking/confirmation/:bookingId" 
                                element={
                                    <ProtectedRoute>
                                        <BookingConfirmation />
                                    </ProtectedRoute>
                                } 
                            />
                        </Routes>
                    </main>
                    <Footer />
                    
                    {/* Back to Top Button */}
                    <button 
                        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
                        onClick={scrollToTop}
                        aria-label="Back to top"
                    />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;