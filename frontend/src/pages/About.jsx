import React from 'react';

const About = () => {
    return (
        <section className="info-page">
            <div className="info-page-header">
                <h1>About OmniWatch Cinema</h1>
                <p>Your premier destination for cinematic excellence</p>
            </div>

            <div className="info-page-content">
                <div className="content-section">
                    <h2>Our Story</h2>
                    <p>
                        Founded in 2001, OmniWatch Cinema has been bringing the magic of movies to audiences 
                        across Ireland for over a decade. What started as a single screen in Dublin has grown 
                        into a network of premium cinema locations, each dedicated to providing an unforgettable 
                        movie-going experience.
                    </p>
                    <p>
                        We believe that watching a film is more than just entertainment—it's an experience that 
                        brings people together. From the latest blockbusters to independent gems, we curate our 
                        selection to offer something for everyone.
                    </p>
                </div>

                <div className="content-section">
                    <h2>Our Mission</h2>
                    <p>
                        To provide world-class cinema experiences through cutting-edge technology, exceptional 
                        customer service, and a genuine passion for film. We're committed to making every visit 
                        to OmniWatch Cinema memorable, comfortable, and exciting.
                    </p>
                </div>

                <div className="content-section">
                    <h2>What Sets Us Apart</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <h3>🎬 Premium Screens</h3>
                            <p>State-of-the-art projection and immersive sound systems including IMAX and Dolby Atmos</p>
                        </div>
                        <div className="feature-item">
                            <h3>🛋️ Luxury Seating</h3>
                            <p>Recliner seats, VIP lounges, and spacious theaters for maximum comfort</p>
                        </div>
                        <div className="feature-item">
                            <h3>🍿 Gourmet Concessions</h3>
                            <p>Beyond popcorn—enjoy artisan snacks, craft beverages, and premium dining options</p>
                        </div>
                        <div className="feature-item">
                            <h3>📱 Digital Innovation</h3>
                            <p>Seamless online booking, mobile tickets, and personalized recommendations</p>
                        </div>
                    </div>
                </div>

                <div className="content-section">
                    <h2>Our Locations</h2>
                    <p>
                        With multiple locations across Dublin and beyond, OmniWatch Cinema is never far away. 
                        Each of our venues offers a unique atmosphere while maintaining our commitment to quality:
                    </p>
                    <ul className="locations-list">
                        <li><strong>OmniWatch Rathmines</strong> - Our flagship location with 12 screens including IMAX</li>
                        <li><strong>OmniWatch City Centre</strong> - Boutique experience in the heart of Dublin</li>
                        <li><strong>OmniWatch Dundrum</strong> - Family-friendly venue with kids' club facilities</li>
                        <li><strong>OmniWatch Blanchardstown</strong> - Our largest multiplex with 16 screens</li>
                    </ul>
                </div>

                <div className="content-section">
                    <h2>Community & Culture</h2>
                    <p>
                        We're more than just a cinema—we're a community hub for film lovers. Throughout the year, 
                        we host special events including:
                    </p>
                    <ul>
                        <li>Film festivals showcasing Irish and international cinema</li>
                        <li>Director Q&A sessions and exclusive screenings</li>
                        <li>Kids' club activities and school holiday programs</li>
                        <li>Classic film retrospectives and themed marathons</li>
                        <li>Accessibility screenings with subtitles and audio description</li>
                    </ul>
                </div>

                <div className="content-section">
                    <h2>Sustainability Commitment</h2>
                    <p>
                        We're committed to reducing our environmental impact through:
                    </p>
                    <ul>
                        <li>Energy-efficient LED lighting and projection systems</li>
                        <li>Comprehensive recycling and waste reduction programs</li>
                        <li>Sustainable sourcing for our food and beverage offerings</li>
                        <li>Digital tickets to reduce paper waste</li>
                    </ul>
                </div>

                <div className="content-section">
                    <h2>Join Our Journey</h2>
                    <p>
                        Whether you're a casual moviegoer or a dedicated cinephile, OmniWatch Cinema welcomes you. 
                        Follow us on social media, sign up for our newsletter, and become part of our community. 
                        Together, let's celebrate the power of storytelling on the big screen.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default About;