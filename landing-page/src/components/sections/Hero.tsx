
const Hero = () => {
     
    
      const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      };
    return (
        <section id="hero"
            className="pt-40 pb-20 bg-gray-950 relative overflow">
            <div className="max-w-7xl mx-auto px-5">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-white">
                            Transform Your <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Body</span>, Transform Your <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Life</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8">Join FitCulture today and become part of a community dedicated to health, strength, and personal growth. Our state-of-the-art facilities and expert trainers will help you achieve your fitness goals.</p>

                        <div className="flex gap-4 justify-center md:justify-start">
                            <button 
                            onClick={() => scrollToSection("#membership")}
                            className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:-translate-y-1 transition-transform shadow-lg shadow-orange-500/30 w-full sm:w-auto">
                Start Your Journey
              </button>
                            <button 
                            onClick={() => scrollToSection("#features")}
                            className="bg-transparent border-2 border-orange-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:bg-orange-500/10 transition-colors w-full sm:w-auto">
                Learn More
              </button>
                        </div>
                    </div>
                    <div className="rounded-xl overflow-hidden shadow-lg shadow-orange-500/30">
                        <div className="w-full h-96 bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300">
                            <img src="https://res.cloudinary.com/dflelt85r/image/upload/v1760409899/low-angle-view-unrecognizable-muscular-build-man-preparing-lifting-barbell-health-club_kscy4n.jpg" alt="gym image" className="w-full h-full" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero