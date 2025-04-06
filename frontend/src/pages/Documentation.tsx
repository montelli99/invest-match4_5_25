import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Book, Search } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/Layout";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");

  const sections = [
    {
      title: "Getting Started",
      articles: [
        { title: "Platform Overview", path: "/docs/overview" },
        { title: "Creating Your Account", path: "/docs/account-creation" },
        { title: "Setting Up Your Profile", path: "/docs/profile-setup" },
        { title: "Understanding Match Scores", path: "/docs/match-scores" },
      ],
    },
    {
      title: "Core Features",
      articles: [
        { title: "Search & Filtering", path: "/docs/search" },
        { title: "Messaging System", path: "/docs/messaging" },
        { title: "Document Sharing", path: "/docs/documents" },
        { title: "Analytics Dashboard", path: "/docs/analytics" },
      ],
    },
    {
      title: "Account Management",
      articles: [
        { title: "Subscription Plans", path: "/docs/subscriptions" },
        { title: "Account Verification", path: "/docs/verification" },
        { title: "Privacy Settings", path: "/docs/privacy" },
        { title: "Security Features", path: "/docs/security" },
      ],
    },
  ];

  return (
    <Layout>
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-card to-background py-24 px-4 border-b">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">Documentation</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Everything you need to know about using InvestMatch effectively
            </p>
              </div>
        </section>

        <div className="container mx-auto py-16 relative">
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

          {/* Search Section */}
          <div className="relative mb-12 max-w-2xl mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>






      {/* Documentation Sections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {sections.map((section, index) => (
          <Card key={index} className="p-6">
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            <ul className="space-y-3">
              {section.articles.map((article, articleIndex) => (
                <li key={articleIndex}>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-left text-muted-foreground hover:text-primary"
                    onClick={() => console.log(`Navigate to: ${article.path}`)}
                  >
                    <span className="flex items-center">
                      {article.title}
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

          {/* Help Section */}
          <Card className="mt-8 p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Need Additional Help?
            </h2>
            <p className="text-muted-foreground">
              Can't find what you're looking for? Our support team is here to
              help.
            </p>
          </div>
          <Button
            onClick={() =>
              (window.location.href = "mailto:support@investmatch.com")
            }
          >
            Contact Support
          </Button>
        </div>
          </Card>

          {/* CTA Section */}
          <section className="relative bg-gradient-to-b from-background to-card py-20 px-4 border-t mt-16">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-muted-foreground mb-8">
                Our support team is always here to assist you with any questions.
              </p>
              <Button 
                size="lg"
                onClick={() => window.location.href = "mailto:support@investmatch.com"}
              >
                Contact Support
              </Button>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
