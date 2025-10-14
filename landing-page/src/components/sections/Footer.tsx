import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Dumbbell,
  Users,
  Apple,
  Briefcase,
  Heart
} from "lucide-react";

const Footer: React.FC = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer id="footer" className="bg-gradient-to-b from-gray-950 to-black border-t border-gray-800 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          
          {/* Company Info */}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent cursor-pointer">
              FitCulture
            </h2>
            <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed">
              Transform your life with our premier fitness and wellness programs. Join a community dedicated to achieving health goals together.
            </p>
            
            {/* Social Media Links */}
            <div className="flex gap-3 justify-center sm:justify-start" role="group" aria-label="Social media links">
              <a 
                href="https://facebook.com/fitculture" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="group text-gray-400 w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-700 hover:border-orange-500 hover:text-orange-500 hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://instagram.com/fitculture" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="group text-gray-400 w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-700 hover:border-orange-500 hover:text-orange-500 hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://twitter.com/fitculture" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
                className="group text-gray-400 w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-700 hover:border-orange-500 hover:text-orange-500 hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://youtube.com/fitculture" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe to our YouTube channel"
                className="group text-gray-400 w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-700 hover:border-orange-500 hover:text-orange-500 hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="text-center sm:text-left" aria-label="Quick navigation">
            <h3 className="text-lg text-white md:text-xl font-semibold mb-4 md:mb-6">Quick Links</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a 
                  href="#home" 
                  onClick={(e) => { e.preventDefault(); scrollToSection("#home"); }}
                  className="text-sm md:text-base text-gray-300 hover:text-orange-500 transition-all inline-block hover:translate-x-1 duration-300"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#features" 
                  onClick={(e) => { e.preventDefault(); scrollToSection("#features"); }}
                  className="text-sm md:text-base text-gray-300 hover:text-orange-500 transition-all inline-block hover:translate-x-1 duration-300"
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="#membership" 
                  onClick={(e) => { e.preventDefault(); scrollToSection("#membership"); }}
                  className="text-sm md:text-base text-gray-300 hover:text-orange-500 transition-all inline-block hover:translate-x-1 duration-300"
                >
                  Membership Plans
                </a>
              </li>
              <li>
                <a 
                  href="#testimonials" 
                  onClick={(e) => { e.preventDefault(); scrollToSection("#feedback"); }}
                  className="text-sm md:text-base text-gray-300 hover:text-orange-500 transition-all inline-block hover:translate-x-1 duration-300"
                >
                  Feedback
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  className="text-sm md:text-base text-gray-300 hover:text-orange-500 transition-all inline-block hover:translate-x-1 duration-300"
                >
                  About Us
                </a>
              </li>
            </ul>
          </nav>

          {/* Services */}
          <nav className="text-center sm:text-left" aria-label="Our services">
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-white">Our Services</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a href="#personal-training" className="text-sm md:text-base text-gray-300 hover:text-orange-500 transition-colors flex items-center gap-2 justify-center sm:justify-start group">
                  <Dumbbell size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Personal Training</span>
                </a>
              </li>
              <li>
                <a href="#group-classes" className="text-sm md:text-base text-gray-300 hover:text-orange-500 transition-colors flex items-center gap-2 justify-center sm:justify-start group">
                  <Users size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Group Classes</span>
                </a>
              </li>
              <li>
                <a href="#nutrition" className="text-sm md:text-base text-gray-300 hover:text-orange-500 transition-colors flex items-center gap-2 justify-center sm:justify-start group">
                  <Apple size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Nutrition Counseling</span>
                </a>
              </li>
              <li>
                <a href="#corporate" className="text-sm md:text-base text-gray-300 hover:text-orange-500 transition-colors flex items-center gap-2 justify-center sm:justify-start group">
                  <Briefcase size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Corporate Wellness</span>
                </a>
              </li>
              <li>
                <a href="#therapy" className="text-sm md:text-base text-gray-300 hover:text-orange-500 transition-colors flex items-center gap-2 justify-center sm:justify-start group">
                  <Heart size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Physical Therapy</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact Information */}
          <address className="text-center sm:text-left not-italic">
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-white">Get In Touch</h3>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-300">
              <li className="flex items-start gap-3 justify-center sm:justify-start group">
                <MapPin size={18} className="text-orange-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-white transition-colors">123 Fitness Street, Health City, HC 12345</span>
              </li>
              <li className="flex items-center gap-3 justify-center sm:justify-start group">
                <Phone size={18} className="text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+15551234567" className="hover:text-white transition-colors">(555) 123-4567</a>
              </li>
              <li className="flex items-center gap-3 justify-center sm:justify-start group">
                <Mail size={18} className="text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:info@fitculture.com" className="hover:text-white transition-colors">info@fitculture.com</a>
              </li>
              <li className="flex items-center gap-3 justify-center sm:justify-start group">
                <Clock size={18} className="text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-white transition-colors">Open 24/7</span>
              </li>
            </ul>
          </address>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 md:pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-xs md:text-sm">
            <p>&copy; {new Date().getFullYear()} FitCulture. All rights reserved.</p>
            <h2 className="text-2xl font-bold bg-gradient-to-br from-orange-500 to-orange-400 text-transparent bg-clip-text cursor-pointer">Grind now, shine later</h2>
            <nav className="flex gap-6" aria-label="Legal">
              <a href="#privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-orange-500 transition-colors">Terms of Service</a>
              <a href="#sitemap" className="hover:text-orange-500 transition-colors">Sitemap</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;