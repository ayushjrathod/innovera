"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loginAlert = () => {
    alert("Login button clicked!");
  };

  return (
    <div className="bg-gray-50 text-gray-900">
      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 w-full py-4 px-8 flex justify-between items-center z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md" : "bg-transparent"
        }`}
      >
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-2xl font-bold text-white">
            Logo
          </Link>
          <div className="hidden md:flex space-x-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/usecase">Use Cases</NavLink>
          </div>
        </div>
        <div className="hidden md:block">
          <button
            className="bg-gray-900 text-white px-6 py-2 rounded-full font-medium hover:bg-gray-700 transition-colors duration-300"
            onClick={loginAlert}
          >
            Login
          </button>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>
              About
            </NavLink>
            <NavLink to="/usecase" onClick={() => setIsMenuOpen(false)}>
              Use Cases
            </NavLink>
            <button
              className="bg-gray-900 text-white px-6 py-2 rounded-full font-medium hover:bg-gray-700 transition-colors duration-300"
              onClick={() => {
                loginAlert();
                setIsMenuOpen(false);
              }}
            >
              Login
            </button>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <img src="/assets/hero.avif" alt="Background" className="absolute w-full h-full object-cover" />
        <div className="relative flex flex-col z-10 text-center p-4">
          <h1 className="text-5xl backdrop-blur-sm rounded-xl p-4 md:text-6xl font-bold text-white mb-3 leading-tight">
            Welcome to Our Virtual Platform
          </h1>
          <p className="text-2xl backdrop-blur-lg rounded-xl font-semibold md:text-2xl text-white mb-4">
            Explore immersive and interactive experiences that transform industries.
          </p>

          <div className="flex max-w-full justify-center">
            <button
              onClick={() => (window.location.href = "https://192.168.205.88:5000/broadcast")}
              className="mt-6 max-w-fit bg-gray-900 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-black transition-all duration-300 hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>
      {/* Virtual Exhibitions Section */}
      <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center py-20 px-6 space-y-12 md:space-y-0 md:space-x-12">
        <div className="md:w-1/2 text-center md:text-left">
          <h2
            className="text-4xl md:text-5xl font-extrabold mb-6"
            style={{
              background: "linear-gradient(to right, #3B82F6, #10B981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Transforming Experiences with Virtual Exhibitions
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Virtual exhibitions revolutionize industries by providing immersive, interactive, and globally accessible
            experiences. Businesses can showcase products at trade shows, startups can pitch ideas to investors, and
            artists can display their work in virtual galleries.
          </p>
          <button className="group inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-300">
            Learn More
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="md:w-1/2">
          <img
            src="/assets/about1.jpeg"
            alt="Virtual Exhibition"
            className="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
          />
        </div>
      </section>
      {/* Beyond Transcripts Section */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center px-6 space-y-12 md:space-y-0 md:space-x-12">
          <div className="md:w-1/2 text-center md:text-left">
            <h2
              className="text-4xl md:text-5xl font-extrabold mb-6"
              style={{
                background: "linear-gradient(to right, #10B981, #3B82F6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Beyond Transcripts
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Your meetings get transcribed with great summaries and notes, but we also analyze transcripts across your
              teams to suggest follow-on meetings, highlight misunderstandings, and add to a shared knowledge
              repository.
            </p>
            <button className="group inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-600 transition-colors duration-300">
              Explore Features
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="md:w-1/2">
            <img
              src="/assets/about2.jpg"
              alt="Beyond Transcripts"
              className="rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="hover:text-blue-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-blue-400 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-blue-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/blog" className="hover:text-blue-400 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/documentation" className="hover:text-blue-400 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="hover:text-blue-400 transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-blue-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center">
            <p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink = ({ to, children, ...props }) => (
  <Link to={to} className="text-white font-semibold hover:text-gray-300 transition-colors duration-300" {...props}>
    {children}
  </Link>
);

export default Home;
