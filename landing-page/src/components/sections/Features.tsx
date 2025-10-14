import type { FeatureCardProps } from "../types/types"

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-8 text-center hover:-translate-y-2 transition-transform shadow-lg hover:shadow-orange-500/30 cursor-pointer">
      <div className="w-full">
        <img src={icon} alt="image" className="cursor-pointer transition-all duration-300 hover:scale-105"/>
      </div>
      <h3 className="text-2xl font-semibold mb-4 text-gray-200 mt-8">{title}</h3>
      <p className="text-gray-400 text-md">{description}</p>
    </div>
  );
};

const Features = () => {
const features: FeatureCardProps[] = [
  {
    icon: "https://res.cloudinary.com/dflelt85r/image/upload/v1760409890/victor-freitas-WvDYdXDzkhs-unsplash_df4ijd.jpg",
    title: "Modern Equipment",
    description: "Access to the latest fitness technology and equipment for all your workout needs."
  },
  {
    icon: "https://res.cloudinary.com/dflelt85r/image/upload/v1760409884/sven-mieke-MsCgmHuirDo-unsplash_x3ekvi.jpg",
    title: "Expert Trainers",
    description: "Certified personal trainers to guide and motivate you through your fitness journey."
  },
  {
    icon: "https://res.cloudinary.com/dflelt85r/image/upload/v1760409865/risen-wang-20jX9b35r_M-unsplash_k0zyhx.jpg",
    title: "Flexible Hours",
    description: "Open 24/7 to fit your busy schedule and workout whenever it's convenient for you."
  },
  {
    icon: "https://res.cloudinary.com/dflelt85r/image/upload/v1760409901/victor-freitas-Yuv-iwByVRQ-unsplash_kfa2ne.jpg",
    title: "Group Classes",
    description: "Join our energizing group classes from yoga to HIIT and everything in between."
  },
  {
    icon: "https://res.cloudinary.com/dflelt85r/image/upload/v1760409899/low-angle-view-unrecognizable-muscular-build-man-preparing-lifting-barbell-health-club_kscy4n.jpg",
    title: "Personalized Plans",
    description: "Get custom workout and nutrition plans tailored to your unique fitness goals."
  },
  {
    icon: "https://res.cloudinary.com/dflelt85r/image/upload/v1760409902/danielle-cerullo-CQfNt66ttZM-unsplash_z7himz.jpg",
    title: "Hygienic Environment",
    description: "Train in a clean, safe, and well-maintained facility with regular sanitization."
  }
];


  return (
    <section id="features" className="bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Why Choose FitCulture
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">We offer everything you need to reach your fitness goals in a supportive and motivating environment.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features