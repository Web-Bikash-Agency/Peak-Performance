import { IndianRupee } from "lucide-react";

interface PlanCardProps {
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}




const PlanCard: React.FC<PlanCardProps> = ({ name, price, features, isPopular }) => {
  return (
    <div className={`bg-gray-950 rounded-xl p-10 text-center border transition-transform hover:-translate-y-2 hover:shadow-lg hover:shadow-orange-500/30 relative ${
      isPopular ? 'border-2 border-orange-500' : 'border border-gray-800'
    }`}>
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-400 text-white py-2 text-xs font-semibold rounded-t-xl">
          MOST POPULAR
        </div>
      )}
      <h3 className={`text-2xl text-white font-semibold mb-4 ${isPopular ? 'mt-8' : ''}`}>{name}</h3>
      <div className="flex items-center justify-center text-5xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
        <IndianRupee className="text-orange-500 w-12 h-12"/>{price}<span className="text-2xl"></span>
      </div>
      <ul className="list-none mb-8">
        {features.map((feature, index) => (
          <li key={index} className="py-2 text-white border-b border-gray-800 last:border-b-0">
            {feature}
          </li>
        ))}
      </ul>
      <button className={`px-6 py-3 rounded-xl cursor-pointer font-semibold transition-all ${
        isPopular 
          ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:-translate-y-1 shadow-lg shadow-orange-500/30' 
          : 'bg-transparent border-2 border-orange-500 text-white hover:bg-orange-500/10'
      }`}>
        Select Plan
      </button>
    </div>
  );
};

// Membership Section
const Membership: React.FC = () => {
  const existingPlans: PlanCardProps[] = [
    {
      name: "1 Month",
      price: 1600,
      features: [
        "Access to gym equipment",
        "Locker room access",
        "Free fitness assessment",
        "Basic workout plan"
      ]
    },
    {
      name: "3 Months",
      price: 2300,
      features: [
        "All Basic features",
        "Unlimited group classes",
        "Personal trainer sessions (2/month)",
        "Nutrition guidance",
        "Bring a friend twice a month"
      ],
      isPopular: true
    },
    {
      name: "6 Months",
      price: 3600,
      features: [
        "All Premium features",
        "Unlimited personal training",
        "Advanced body composition analysis",
        "Customized meal plans",
        "Priority class booking"
      ]
    },
    {
      name: "1 Year",
      price: 6600,
      features: [
        "All Premium features",
        "Unlimited personal training",
        "Advanced body composition analysis",
        "Customized meal plans",
        "Priority class booking"
      ]
    }
  ];
  const NonExistingPlans: PlanCardProps[] = [
    {
      name: "1 Day",
      price: 50,
      features: [
        "Access to gym equipment",
        "Locker room access",
        "Free fitness assessment",
        "Basic workout plan"
      ]
    },
    {
      name: "1 Week",
      price: 250,
      features: [
        "All Basic features",
        "Unlimited group classes",
        "Personal trainer sessions (2/month)",
        "Nutrition guidance",
        "Bring a friend twice a month"
      ],
      isPopular: true
    },
    {
      name: "15 Days",
      price: 500,
      features: [
        "All Premium features",
        "Unlimited personal training",
        "Advanced body composition analysis",
        "Customized meal plans",
        "Priority class booking"
      ]
    },
    {
      name: "1 Month",
      price: 800,
      features: [
        "All Premium features",
        "Unlimited personal training",
        "Advanced body composition analysis",
        "Customized meal plans",
        "Priority class booking"
      ]
    }
  ];

  return (
    <section id="membership" className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-4xl text-white font-bold mb-4">Membership Plans</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that works best for your fitness goals and budget.
          </p>
        </div>

        {/* Existing PlanCards  */}
        <div className="border border-b-gray-800 shadow-lg pb-10 rounded-lg">
        <div className="text-center mb-12">
           <h2 className="text-2xl bg-gradient-to-br from-orange-500 to-orange-400 text-transparent bg-clip-text font-bold mb-4"><span>For Existing Members</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that works best for your fitness goals and budget.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {existingPlans.map((ep, index) => (
            <PlanCard key={index} {...ep} />
          ))}
        </div>

        </div>
        {/* Non Existing PlanCards  */}
        <div className="mt-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl bg-gradient-to-br from-orange-500 to-orange-400 text-transparent bg-clip-text font-bold mb-4"><span>For Non-Existing Members</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that works best for your fitness goals and budget.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {NonExistingPlans.map((nep, index) => (
            <PlanCard key={index} {...nep} />
          ))}
        </div>

        </div>
      </div>
    </section>
  );
};


export default Membership;