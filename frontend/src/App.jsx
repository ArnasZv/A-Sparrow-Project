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
import Payment from './pages/Payment';
import Login from './pages/Login';
import OmniPass from './pages/OmniPass';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookingConfirmation from './pages/BookingConfirmation';
import UserProfile from './pages/UserProfile';
import ResetPassword from './pages/ResetPassword';



//footer page
import Contact from './pages/Contact';
import About from './pages/About';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';

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
                            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/omnipass" element={<OmniPass />} />
                            <Route path="/FAQ" element={<FAQ />} />
                            <Route path="/Terms" element={<Terms />} />
                            <Route path='/Privacy' element={<Privacy />} />
                            
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
                                path="/profile" 
                                element={
                                    <ProtectedRoute>
                                        <UserProfile />
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
                                path="/payment" 
                                element={
                                    <ProtectedRoute>
                                        <Payment />
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