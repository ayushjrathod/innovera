import { ArrowRight, BarChart, Globe, Zap } from "lucide-react";
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
        className={`fixed top-0 w-full py-4 px-8 flex justify-between items-center z-50 transition-all duration-300 backdrop-blur-sm ${
          isScrolled ? "bg-white shadow-md" : "bg-black/20"
        }`}
      >
        <div className="flex items-center space-x-6">
          <Link to="/" className={`text-2xl font-bold ${isScrolled ? "text-black" : "text-white"}`}>
            Devrishis
          </Link>
          <div className="hidden md:flex space-x-6">
            <NavLink to="/" isScrolled={isScrolled}>
              Home
            </NavLink>
            <NavLink to="/about" isScrolled={isScrolled}>
              About
            </NavLink>
            <NavLink to="/usecase" isScrolled={isScrolled}>
              Use Cases
            </NavLink>
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
        <div className="backdrop-blur-[4px] bg-black/10 relative z-10 text-center p-4 bg-opacity-50 rounded-xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            Welcome to Our Virtual Platform
          </h1>
          <p className="text-2xl md:text-2xl font-semibold text-white mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
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
      <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-center leading-snug">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
              Transforming Experiences with Virtual Exhibitions
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <FeatureCard
                icon={<Globe className="w-8 h-8 text-blue-500" />}
                title="Global Accessibility"
                description="Reach audiences worldwide, breaking geographical barriers and expanding your market reach."
              />
              <FeatureCard
                icon={<Zap className="w-8 h-8 text-yellow-500" />}
                title="Interactive Experiences"
                description="Engage visitors with immersive 3D environments, real-time interactions, and personalized journeys."
              />
              <FeatureCard
                icon={<BarChart className="w-8 h-8 text-green-500" />}
                title="Data-Driven Insights"
                description="Gain valuable analytics on visitor behavior, preferences, and engagement to optimize your exhibitions."
              />
            </div>
            <div className="relative">
              <img src="/assets/about1.jpeg" alt="Virtual Exhibition" className="rounded-lg shadow-2xl" />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-xl">
                <p className="text-2xl font-bold text-gray-800 leading-loose">200+</p>
                <p className="text-sm text-gray-600 leading-relaxed">Successful Exhibitions</p>
              </div>
            </div>
          </div>
          <div className="mt-16 text-center">
            <button className="group inline-flex items-center bg-gradient-to-r from-blue-600 to-teal-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-teal-600 transition-all duration-300 transform hover:scale-105">
              Explore Virtual Exhibitions
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
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
            <p>&copy; {new Date().getFullYear()} Team Devrishis.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink = ({ to, children, isScrolled, ...props }) => (
  <Link
    to={to}
    className={`font-semibold transition-colors duration-300 ${
      isScrolled ? "text-black hover:text-gray-600" : "text-white hover:text-gray-300"
    }`}
    {...props}
  >
    {children}
  </Link>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

export default Home;
