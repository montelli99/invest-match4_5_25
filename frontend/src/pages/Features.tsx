import { Layout } from "@/components/Layout";
import { FeaturePresentation } from "@/components/FeaturePresentation";
import { FeatureSection } from "@/components/FeatureSection";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Features() {
  const features = [
    {
      title: "Smart Matching Algorithm",
      description: "Our intelligent matching system connects you with the perfect investment partners based on multiple criteria including investment focus, fund size, and track record.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
      highlights: [
        "Advanced filtering based on multiple criteria",
        "Real-time match percentage calculation",
        "Customizable matching preferences",
        "Global matching capabilities"
      ]
    },
    {
      title: "Secure Document Management",
      description: "Enterprise-grade security for all your sensitive documents with comprehensive version control and detailed audit trails.",
      image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&q=80",
      highlights: [
        "End-to-end encryption",
        "Version control system",
        "Detailed audit logs",
        "Secure sharing capabilities"
      ]
    },
    {
      title: "Advanced Analytics Dashboard",
      description: "Gain valuable insights into your profile performance, engagement metrics, and investment opportunities through our comprehensive analytics suite.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
      highlights: [
        "Real-time performance metrics",
        "Custom report generation",
        "Engagement tracking",
        "Investment trend analysis"
      ]
    },
    {
      title: "Global Contact Network",
      description: "Build and manage your professional network with our powerful contact management and introduction system.",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80",
      highlights: [
        "Contact import and management",
        "Network visualization",
        "Introduction requests",
        "Relationship tracking"
      ]
    },
    {
      title: "Premium Communication Suite",
      description: "Stay connected with potential partners through our secure messaging and collaboration tools.",
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80",
      highlights: [
        "Secure instant messaging",
        "Document sharing",
        "Video conferencing",
        "Meeting scheduling"
      ]
    },
    {
      title: "Compliance & Security",
      description: "Maintain compliance with industry regulations while protecting sensitive data through our comprehensive security features.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80",
      highlights: [
        "Data encryption",
        "Compliance reporting",
        "Access controls",
        "Security auditing"
      ]
    }
  ];
  const navigate = useNavigate();

  const platformFeatures = {
    title: "Platform Capabilities",
    description: "Discover the comprehensive suite of tools and features that make InvestMatch the leading platform for investment networking.",
    features: [
      {
        title: "Smart Matching Algorithm",
        description: "Our advanced algorithm considers multiple factors to create optimal matches between investors and opportunities."
      },
      {
        title: "Secure Document Management",
        description: "Enterprise-grade security for all your sensitive documents with version control and audit trails."
      },
      {
        title: "Global Contact Network",
        description: "Import and manage your professional network with our global matching system."
      },
      {
        title: "Advanced Analytics",
        description: "Get detailed insights into your profile performance and engagement metrics."
      },
      {
        title: "Compliance Tools",
        description: "Stay compliant with built-in tools for data privacy and regulatory requirements."
      },
      {
        title: "Premium Communication",
        description: "Secure messaging, document sharing, and real-time collaboration tools."
      }
    ]
  };

  const subscriptionFeatures = {
    title: "Subscription Benefits",
    description: "Choose the perfect plan for your needs with our flexible subscription options.",
    features: [
      {
        title: "Flexible Trial Options",
        description: "Start with a 3, 6, or 9-month trial period to explore all premium features."
      },
      {
        title: "Tiered Access Levels",
        description: "Scale your access and features based on your business needs."
      },
      {
        title: "Custom Enterprise Solutions",
        description: "Tailored solutions for large organizations with specific requirements."
      }
    ]
  };

  return (
    <Layout>
      <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              Powerful Features for
              <span className="text-primary"> Investment Networking</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Discover how InvestMatch helps you connect with the right investment partners
              through our comprehensive suite of features.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                size="lg"
                onClick={() => navigate("/CreateProfile")}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/Search")}
              >
                Explore Platform
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-16">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`flex flex-col lg:flex-row gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Feature Image */}
                <div className="lg:w-1/2">
                  <div className="relative rounded-xl overflow-hidden aspect-video">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                {/* Feature Content */}
                <div className="lg:w-1/2 space-y-6">
                  <h3 className="text-3xl font-bold">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start">
                        <svg
                          className="h-6 w-6 text-primary flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="ml-3 text-base">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-card to-background py-24 px-4 border-b">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">Discover InvestMatch Features</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with the right investment partners through our intelligent matching platform
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/CreateProfile")} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/Search")}>
              Explore Matches
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-b from-background to-card py-20 px-4 border-t">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join InvestMatch today and discover the perfect investment partnerships.
          </p>
          <Button size="lg" onClick={() => navigate("/CreateProfile")}>
            Create Your Profile
          </Button>
        </div>
      </section>
    </main>
    </Layout>
  );
}
