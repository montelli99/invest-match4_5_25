import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface Feature {
  id: number;
  title: string;
  description: string;
  details: string[];
  icon?: string;
  demo?: {
    image: string;
    video?: string;
  };
  stats?: {
    label: string;
    value: string;
  }[];
}

const features: Feature[] = [
  {
    id: 1,
    title: "User Management & Authentication",
    description: "Comprehensive user management system with role-based access control",
    details: [
      "User profile creation and management",
      "Role-based access (Fund Managers, Limited Partners, Capital Raisers)",
      "Secure authentication system with Firebase",
    ],
    demo: {
      image: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80",
    },
    stats: [
      { label: "Active Users", value: "10,000+" },
      { label: "Success Rate", value: "99.9%" },
      { label: "Response Time", value: "<100ms" },
    ],
  },
  {
    id: 2,
    title: "Profile & Matching",
    description: "Advanced profile creation and matching system",
    details: [
      "Detailed profile creation with role-specific fields",
      "Advanced matching algorithm",
      "Global matching settings for contacts",
      "Contact import and management",
    ],
    demo: {
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
    },
    stats: [
      { label: "Match Accuracy", value: "95%" },
      { label: "Daily Matches", value: "1,000+" },
      { label: "Success Stories", value: "500+" },
    ],
  },
  {
    id: 3,
    title: "Search & Discovery",
    description: "Powerful search functionality with advanced filters",
    details: [
      "Advanced search functionality with filters",
      "Search preferences and saved searches",
      "Match percentage display",
    ],
    demo: {
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80",
    },
    stats: [
      { label: "Search Speed", value: "<0.5s" },
      { label: "Filter Options", value: "50+" },
      { label: "Daily Searches", value: "5,000+" },
    ],
  },
  {
    id: 4,
    title: "Communication",
    description: "Comprehensive communication tools for networking",
    details: [
      "Direct messaging system",
      "Document sharing capabilities",
      "Real-time typing indicators",
      "Contact networking and introductions",
    ],
    demo: {
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80",
    },
    stats: [
      { label: "Messages/Day", value: "50,000+" },
      { label: "Avg Response", value: "<1h" },
      { label: "File Sharing", value: "Unlimited" },
    ],
  },
  {
    id: 5,
    title: "Dashboard Analytics",
    description: "Role-specific dashboards with detailed analytics",
    details: [
      "Role-specific dashboards",
      "Performance metrics and visualizations",
      "Profile engagement tracking",
    ],
    demo: {
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
    },
    stats: [
      { label: "Data Points", value: "100+" },
      { label: "Update Freq", value: "Real-time" },
      { label: "Export Options", value: "5" },
    ],
  },
  {
    id: 1,
    title: "User Management & Authentication",
    description: "Comprehensive user management system with role-based access control",
    details: [
      "User profile creation and management",
      "Role-based access (Fund Managers, Limited Partners, Capital Raisers)",
      "Secure authentication system with Firebase",
    ],
    demo: {
      image: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80",
    },
    stats: [
      { label: "Active Users", value: "10,000+" },
      { label: "Success Rate", value: "99.9%" },
      { label: "Response Time", value: "<100ms" },
    ],
  },
  {
    id: 2,
    title: "Profile & Matching",
    description: "Advanced profile creation and matching system",
    details: [
      "Detailed profile creation with role-specific fields",
      "Advanced matching algorithm",
      "Global matching settings for contacts",
      "Contact import and management",
    ],
    demo: {
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
    },
    stats: [
      { label: "Match Accuracy", value: "95%" },
      { label: "Daily Matches", value: "1,000+" },
      { label: "Success Stories", value: "500+" },
    ],
  },
  {
    id: 3,
    title: "Search & Discovery",
    description: "Powerful search functionality with advanced filters",
    details: [
      "Advanced search functionality with filters",
      "Search preferences and saved searches",
      "Match percentage display",
    ],
    demo: {
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80",
    },
    stats: [
      { label: "Search Speed", value: "<0.5s" },
      { label: "Filter Options", value: "50+" },
      { label: "Daily Searches", value: "5,000+" },
    ],
  },
  {
    id: 4,
    title: "Communication",
    description: "Comprehensive communication tools for networking",
    details: [
      "Direct messaging system",
      "Document sharing capabilities",
      "Real-time typing indicators",
      "Contact networking and introductions",
    ],
    demo: {
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80",
    },
    stats: [
      { label: "Messages/Day", value: "50,000+" },
      { label: "Avg Response", value: "<1h" },
      { label: "File Sharing", value: "Unlimited" },
    ],
  },
  {
    id: 5,
    title: "Dashboard Analytics",
    description: "Role-specific dashboards with detailed analytics",
    details: [
      "Role-specific dashboards",
      "Performance metrics and visualizations",
      "Profile engagement tracking",
    ],
    demo: {
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
    },
    stats: [
      { label: "Data Points", value: "100+" },
      { label: "Update Freq", value: "Real-time" },
      { label: "Export Options", value: "5" },
    ],
  },
  {
    id: 1,
    title: "User Management & Authentication",
    description:
      "Comprehensive user management system with role-based access control",
    details: [
      "User profile creation and management",
      "Role-based access (Fund Managers, Limited Partners, Capital Raisers)",
      "Secure authentication system with Firebase",
    ],
  },
  {
    id: 2,
    title: "Profile & Matching",
    description: "Advanced profile creation and matching system",
    details: [
      "Detailed profile creation with role-specific fields",
      "Advanced matching algorithm",
      "Global matching settings for contacts",
      "Contact import and management",
    ],
  },
  {
    id: 3,
    title: "Search & Discovery",
    description: "Powerful search functionality with advanced filters",
    details: [
      "Advanced search functionality with filters",
      "Search preferences and saved searches",
      "Match percentage display",
    ],
  },
  {
    id: 4,
    title: "Communication",
    description: "Comprehensive communication tools for networking",
    details: [
      "Direct messaging system",
      "Document sharing capabilities",
      "Real-time typing indicators",
      "Contact networking and introductions",
    ],
  },
  {
    id: 5,
    title: "Dashboard Analytics",
    description: "Role-specific dashboards with detailed analytics",
    details: [
      "Role-specific dashboards",
      "Performance metrics and visualizations",
      "Profile engagement tracking",
    ],
  },
];

export function FeaturePresentation() {
  const [isHovered, setIsHovered] = useState(-1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => {
      const nextSlide = prev + newDirection;
      if (nextSlide >= features.length) return 0;
      if (nextSlide < 0) return features.length - 1;
      return nextSlide;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">InvestMatch Features</h1>
        <p className="text-muted-foreground">
          Discover our comprehensive platform features
        </p>
      </div>

      <div className="relative h-[600px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute w-full cursor-grab active:cursor-grabbing"
          >
            <Card 
              className="p-8 shadow-lg border-2 hover:border-primary/20 transition-all hover:shadow-xl overflow-hidden"
              onMouseEnter={() => setIsHovered(currentSlide)}
              onMouseLeave={() => setIsHovered(-1)}
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">
                {features[currentSlide].title}
              </h2>
              <p className="text-muted-foreground mb-6">
                {features[currentSlide].description}
              </p>
              <ul className="space-y-2">
                {features[currentSlide].details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

                  {features[currentSlide].stats && (
                    <div className="mt-8 grid grid-cols-3 gap-4">
                      {features[currentSlide].stats?.map((stat, index) => (
                        <div 
                          key={index} 
                          className={`text-center p-4 rounded-lg transition-all duration-300 ${isHovered === currentSlide ? 'bg-primary/5' : ''}`}
                        >
                          <div className="text-2xl font-bold text-primary">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {features[currentSlide].demo && (
                  <div className="relative rounded-lg overflow-hidden group">
                    <img
                      src={features[currentSlide].demo?.image}
                      alt={features[currentSlide].title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <Button variant="secondary" className="w-full">
                        View Demo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => paginate(-1)}
          className="w-[100px]"
        >
          Previous
        </Button>
        <Button onClick={() => paginate(1)} className="w-[100px]">
          Next
        </Button>
        </div>

        <div className="flex justify-center gap-2 mt-4 mb-8">
        {features.map((_, index) => (
          <Button
            key={index}
            variant={currentSlide === index ? "default" : "outline"}
            className="w-3 h-3 p-0 rounded-full"
            onClick={() => {
              setDirection(index > currentSlide ? 1 : -1);
              setCurrentSlide(index);
            }}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
