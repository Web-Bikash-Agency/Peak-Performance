export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export interface PlanCardProps {
  name: string;
  price: string | number;
  features: string[];
  isPopular?: boolean;
}

export interface TestimonialCardProps {
  text: string;
  authorName: string;
  authorInitials: string;
  memberSince: string;
}