import React from 'react';
// Import various components that make up the Home page layout
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

/**
 * Home component represents the main landing page of the application.
 * It aggregates various sections like Header, Hero, Features, Stats, Testimonials, and Footer.
 */
function Home() {
  return (
    // Main container for the Home page with a minimum screen height and background color
    <div className="min-h-screen bg-gray-50">
      <Header />       {/* Renders the application header */}
      <Hero />         {/* Renders the hero section with a call to action */}
      <Features />     {/* Renders the features section */}
      <Stats />        {/* Renders key statistics or highlights */}
      <Testimonials /> {/* Renders customer testimonials */}
      <Footer />       {/* Renders the application footer */}
    </div>
  );
}

export default Home;