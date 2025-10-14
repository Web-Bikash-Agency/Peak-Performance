
const CTASection = () => {
    return (

        <section className="py-12 md:py-20 bg-gray-900 text-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-white">Ready to Start Your Fitness Journey?</h2>
                <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto mb-6 md:mb-8 px-4 ">
                    Join thousands of members who have transformed their lives with FitCulture. Your first week is on us!
                </p>
                <button className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:-translate-y-1 transition-transform shadow-lg shadow-orange-500/30 w-full sm:w-auto cursor-pointer">
                   Fill Out The Form
                </button>
            </div>
        </section>

    )
}

export default CTASection