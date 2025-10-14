'use client';

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Dumbbell, Home, Star, Users, MessageSquare, Phone, Globe } from "lucide-react";
import Dock from "../ui/Dock";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { name: "Home", href: "#hero", icon: <Home className="w-5 h-5 text-white" /> },
    { name: "Features", href: "#features", icon: <Star className="w-5 h-5 text-white" /> },
    { name: "Membership", href: "#membership", icon: <Users className="w-5 h-5 text-white" /> },
    { name: "Feedback", href: "#feedback", icon: <MessageSquare className="w-5 h-5 text-white" /> },
    { name: "Contact", href: "#footer", icon: <Phone className="w-5 h-5 text-white" /> },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* HEADER */}
      <header
        id="header"
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-gray-950/95 backdrop-blur-lg shadow-lg"
            : "bg-gray-950"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center py-4 md:py-6">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => scrollToSection("#hero")}
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-400 p-2 rounded-lg shadow-glow">
                <Dumbbell className="w-7 h-7 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                FitCulture
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-100 font-medium hover:text-orange-400 transition-colors"
                >
                  {item.name}
                </button>
              ))}
              <Button className="text-white bg-gradient-to-br from-orange-500 to-orange-400">
                Login
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Button className="text-white bg-gradient-to-br from-orange-500 to-orange-400">
                <Globe className="w-4 h-4 mr-1"/> Login
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* ✅ MOBILE DOCK NAVIGATION */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <Dock
          items={navItems.map((item) => ({
            icon: item.icon,
            label: item.name,
            onClick: () => scrollToSection(item.href),
          }))}
          baseItemSize={50}
          magnification={70}
          panelHeight={64}
          dockHeight={200}
          className="bg-gray-950/90 backdrop-blur-md border border-neutral-700"
        />
      </div>
    </>
  );
};

export default Header;
