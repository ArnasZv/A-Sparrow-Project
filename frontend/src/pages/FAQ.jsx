import React, { useState } from 'react';

const FAQ = () => {
    const [openQuestion, setOpenQuestion] = useState(null);

    const toggleQuestion = (index) => {
        setOpenQuestion(openQuestion === index ? null : index);
    };

    const faqs = [
        {
            category: "Booking & Tickets",
            questions: [
                {
                    q: "How do I book tickets online?",
                    a: "Simply browse our movie listings, select your preferred showtime, choose your seats on our interactive seat map, and complete your purchase securely online. You'll receive a confirmation email with your booking details and e-ticket."
                },
                {
                    q: "Can I cancel or modify my booking?",
                    a: "You can cancel your booking up to 2 hours before the showtime for a full refund. To cancel, log into your account, go to 'My Bookings', and select the cancel option. Seat changes are not available once a booking is confirmed."
                },
                {
                    q: "Do I need to print my tickets?",
                    a: "No! We offer digital tickets. Simply show the QR code from your confirmation email on your phone at the cinema entrance. You can also add tickets to your digital wallet for quick access."
                },
                {
                    q: "What payment methods do you accept?",
                    a: "We accept all major credit and debit cards (Visa, Mastercard, American Express), Google Pay, and Apple Pay. All transactions are secure and encrypted."
                },
                {
                    q: "Can I book tickets for someone else?",
                    a: "Yes! When booking, you can enter the recipient's email address to send the tickets directly to them. Perfect for gifts!"
                }
            ]
        },
        {
            category: "Pricing & Discounts",
            questions: [
                {
                    q: "What are your ticket prices?",
                    a: "Standard tickets start at €10.50. VIP seats are €15.75, and Recliner seats are €13.65. Prices may vary for special formats like IMAX or 3D. A €1.00 booking fee applies to online reservations."
                },
                {
                    q: "Do you offer student discounts?",
                    a: "Yes! Students receive 20% off with a valid student ID. The discount is available Monday-Thursday before 5 PM. Show your ID at the box office or upload verification online."
                },
                {
                    q: "What is MyOmniPass?",
                    a: "MyOmniPass is our loyalty program offering unlimited movies for a monthly fee, exclusive discounts on concessions, priority booking, and special member events. Visit our MyOmniPass page to learn more."
                },
                {
                    q: "Do you have family or group discounts?",
                    a: "Yes! Groups of 10+ receive 15% off. Family packages (2 adults + 2 children) are available for selected showtimes. Contact our group bookings team for corporate events and school trips."
                }
            ]
        },
        {
            category: "Cinema Experience",
            questions: [
                {
                    q: "What seat types do you offer?",
                    a: "We offer Standard seats (comfortable cinema seating), VIP seats (premium leather with extra legroom), and Recliner seats (fully reclining with personal space). Seat availability varies by screen."
                },
                {
                    q: "Are your cinemas wheelchair accessible?",
                    a: "Absolutely! All our locations are fully wheelchair accessible with designated seating areas, accessible restrooms, and ramps. Contact us in advance if you need assistance."
                },
                {
                    q: "Do you offer subtitled or audio-described screenings?",
                    a: "Yes! We schedule regular subtitled screenings and audio-described performances for select films. Check our accessibility page for the schedule or contact customer service."
                },
                {
                    q: "Can I bring my own food and drinks?",
                    a: "Outside food and beverages are not permitted. However, we offer a wide range of snacks, meals, and drinks at our concession stands, including healthy options and dietary alternatives."
                }
            ]
        },
        {
            category: "Account & Technical",
            questions: [
                {
                    q: "I forgot my password. How do I reset it?",
                    a: "Click 'Forgot Password' on the login page, enter your email address, and we'll send you a reset link. The link is valid for 24 hours."
                },
                {
                    q: "I didn't receive my confirmation email",
                    a: "Check your spam/junk folder first. If it's not there, log into your account and view 'My Bookings' to access your tickets. You can also contact customer support for assistance."
                },
                {
                    q: "How do I update my account information?",
                    a: "Log into your account, go to 'Profile', and update your details. Don't forget to click 'Save Changes' when done."
                },
                {
                    q: "Is my payment information secure?",
                    a: "Yes! We use industry-standard SSL encryption and partner with Stripe for payment processing. We never store your full card details on our servers."
                }
            ]
        },
        {
            category: "Showtime & Schedule",
            questions: [
                {
                    q: "When do you post new showtimes?",
                    a: "New showtimes are typically posted on Tuesdays for the following week. Major releases may be posted earlier. Sign up for our newsletter to get early access to new showtimes."
                },
                {
                    q: "Do you have late-night showings?",
                    a: "Yes! We offer late-night screenings on Fridays and Saturdays, typically starting at 10:30 PM or later. Check our schedule for specific times."
                },
                {
                    q: "What time should I arrive before my showing?",
                    a: "We recommend arriving 15-20 minutes before your showtime to find parking, pick up concessions, and get settled. Trailers typically run for 15 minutes."
                },
                {
                    q: "What happens if I'm late to my showing?",
                    a: "While we can't guarantee entry after the film has started, our staff will do their best to seat you during an appropriate moment. Please arrive on time to enjoy the full experience."
                }
            ]
        },
        {
            category: "Refunds & Issues",
            questions: [
                {
                    q: "What is your refund policy?",
                    a: "Full refunds are available up to 2 hours before the showtime. After that, refunds are only issued in exceptional circumstances such as technical difficulties or film cancellations."
                },
                {
                    q: "What if there's a technical problem during my movie?",
                    a: "Notify our staff immediately. We'll fix the issue or offer you alternative screening times plus complimentary tickets as an apology."
                },
                {
                    q: "I was charged twice for my booking",
                    a: "This is usually a temporary authorization hold that will be released by your bank. If the charge doesn't disappear within 3-5 business days, contact our customer support with your booking reference."
                }
            ]
        }
    ];

    return (
        <section className="info-page">
            <div className="info-page-header">
                <h1>Frequently Asked Questions</h1>
                <p>Find answers to common questions about OmniWatch Cinema</p>
            </div>

            <div className="info-page-content">
                <div className="faq-search">
                    <p>Can't find what you're looking for? <a href="/contact">Contact our support team</a></p>
                </div>

                {faqs.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="faq-category">
                        <h2 className="faq-category-title">{category.category}</h2>
                        <div className="faq-list">
                            {category.questions.map((faq, questionIndex) => {
                                const globalIndex = `${categoryIndex}-${questionIndex}`;
                                const isOpen = openQuestion === globalIndex;
                                
                                return (
                                    <div key={questionIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                                        <button 
                                            className="faq-question"
                                            onClick={() => toggleQuestion(globalIndex)}
                                        >
                                            <span>{faq.q}</span>
                                            <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                                        </button>
                                        {isOpen && (
                                            <div className="faq-answer">
                                                <p>{faq.a}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="content-section">
                    <h2>Still Have Questions?</h2>
                    <p>
                        If you couldn't find the answer you were looking for, our customer support team 
                        is here to help. You can reach us via:
                    </p>
                    <ul>
                        <li><strong>Email:</strong> support@omniwatch.com</li>
                        <li><strong>Phone:</strong> +353 1 234 5678</li>
                        <li><strong>Live Chat:</strong> Available on our website Mon-Fri 9 AM - 6 PM</li>
                        <li><strong>Contact Form:</strong> <a href="/contact">Visit our contact page</a></li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default FAQ;