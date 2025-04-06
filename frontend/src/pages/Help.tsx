import { PrivacyGuide } from "@/components/PrivacyGuide";
import { SuggestedArticles } from "@/components/SuggestedArticles";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProfileFlow } from "@/components/ProfileFlow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  FileText,
  Globe2,
  HelpCircle,
  LineChart,
  MessageCircle,
  Search,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";

export default function Help() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <Breadcrumb />

      <div className="flex gap-6 mt-6">
        {/* Left Sidebar - Table of Contents */}
        <Card className="w-64 p-4 h-fit sticky top-6">
          <nav className="space-y-2">
            <a
              href="#support"
              className="flex items-center gap-2 text-sm hover:text-primary p-2 rounded-md hover:bg-accent/10"
            >
              <MessageCircle className="h-4 w-4" /> Support
            </a>
            <a
              href="#getting-started"
              className="flex items-center gap-2 text-sm hover:text-primary p-2 rounded-md hover:bg-accent/10"
            >
              <BookOpen className="h-4 w-4" /> Getting Started
            </a>
            <a
              href="#user-roles"
              className="flex items-center gap-2 text-sm hover:text-primary p-2 rounded-md hover:bg-accent/10"
            >
              <Users className="h-4 w-4" /> User Roles
            </a>
            <a
              href="#profile-management"
              className="flex items-center gap-2 text-sm hover:text-primary p-2 rounded-md hover:bg-accent/10"
            >
              <UserCircle className="h-4 w-4" /> Profile Management
            </a>
            <a
              href="#matching-system"
              className="flex items-center gap-2 text-sm hover:text-primary p-2 rounded-md hover:bg-accent/10"
            >
              <Search className="h-4 w-4" /> Matching System
            </a>
            <a
              href="#communication"
              className="flex items-center gap-2 text-sm hover:text-primary p-2 rounded-md hover:bg-accent/10"
            >
              <MessageCircle className="h-4 w-4" /> Communication
            </a>
            <a
              href="#analytics"
              className="flex items-center gap-2 text-sm hover:text-primary p-2 rounded-md hover:bg-accent/10"
            >
              <LineChart className="h-4 w-4" /> Analytics
            </a>
            <a
              href="#contact-management"
              className="flex items-center gap-2 text-sm hover:text-primary p-2 rounded-md hover:bg-accent/10"
            >
              <Briefcase className="h-4 w-4" /> Contact Management
            </a>
            <a
              href="#settings"
              className="flex items-center gap-2 text-sm hover:text-primary p-2 rounded-md hover:bg-accent/10"
            >
              <Settings className="h-4 w-4" /> Settings
            </a>
            <a
              href="#privacy"
              className="flex items-center gap-2 text-sm hover:text-primary p-2 rounded-md hover:bg-accent/10"
            >
              <Globe2 className="h-4 w-4" /> Privacy & Data
            </a>
            <a
              href="#faq"
              className="flex items-center gap-2 text-sm hover:text-primary p-2 rounded-md hover:bg-accent/10"
            >
              <HelpCircle className="h-4 w-4" /> FAQ
            </a>
          </nav>
        </Card>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Getting Started */}
          <section id="getting-started" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <Card className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>Welcome to InvestMatch</h3>
                <p>
                  InvestMatch is a platform designed to connect Fund Managers,
                  Capital Raisers, and Limited Partners. This guide will help
                  you get started and make the most of our platform.
                </p>

                <h4>Quick Start Guide</h4>
                <ol>
                  <li>
                    <strong>Sign Up:</strong> Create your account using your
                    email or Google account
                  </li>
                  <li>
                    <strong>Choose Your Role:</strong> Select whether you're a
                    Fund Manager, Limited Partner, or Capital Raiser
                  </li>
                  <li>
                    <strong>Complete Your Profile:</strong> Add your
                    professional information and preferences
                  </li>
                  <li>
                    <strong>Start Matching:</strong> Begin connecting with
                    potential partners
                  </li>
                </ol>
              </div>
            </Card>
          </section>

          {/* User Roles */}
          <section id="user-roles" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">
              User Roles & Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fund Managers</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Showcase fund performance</li>
                  <li>• Connect with qualified investors</li>
                  <li>• Access detailed analytics</li>
                  <li>• Schedule investor meetings</li>
                </ul>
              </Card>

              <Card className="p-6">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Limited Partners</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Find matching investment opportunities</li>
                  <li>• Review fund performance</li>
                  <li>• Direct communication with managers</li>
                  <li>• Track investment interests</li>
                </ul>
              </Card>

              <Card className="p-6">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Capital Raisers</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Import and manage contacts</li>
                  <li>• Facilitate introductions</li>
                  <li>• Track networking progress</li>
                  <li>• Monitor success metrics</li>
                </ul>
              </Card>
            </div>
          </section>

          {/* Profile Management */}
          <section id="profile-management" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">Profile Management</h2>
            <ProfileFlow className="mb-6" />
            <Card className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>Creating and Managing Your Profile</h3>
                <p>
                  Your profile is your digital identity on InvestMatch. Make
                  sure it's complete and up-to-date to maximize your matching
                  potential.
                </p>

                <h4>Profile Sections</h4>
                <ul>
                  <li>
                    <strong>Basic Information:</strong> Your name, company, and
                    contact details
                  </li>
                  <li>
                    <strong>Professional Background:</strong> Experience,
                    credentials, and track record
                  </li>
                  <li>
                    <strong>Investment Preferences:</strong> Focus areas, fund
                    sizes, and risk tolerance
                  </li>
                  <li>
                    <strong>Documentation:</strong> Verification documents and
                    credentials
                  </li>
                </ul>

                <div className="not-prose">
                  <Button variant="outline" className="mt-4">
                    <UserCircle className="h-4 w-4 mr-2" /> Edit Your Profile
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Matching System */}
          <section id="matching-system" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">Matching System</h2>
            <Card className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>How Our Matching Works</h3>
                <p>
                  Our intelligent matching system uses a sophisticated weighted scoring system to
                  connect you with the most relevant partners. Understanding how it works will help
                  you maximize your matching potential.
                </p>

                <h4>Core Matching Criteria</h4>
                <p>
                  Different criteria carry different weights in the matching process, reflecting their
                  importance in creating successful partnerships:
                </p>
                <ul>
                  <li>
                    <strong>Investment Focus (20%):</strong> Alignment in sector preferences and
                    investment strategies
                  </li>
                  <li>
                    <strong>Fund Type (15%):</strong> Compatibility between investment vehicle
                    types
                  </li>
                  <li>
                    <strong>Historical Returns (15%):</strong> Track record and performance
                    metrics
                  </li>
                  <li>
                    <strong>Fund Size (10%):</strong> Alignment of investment capacity and
                    requirements
                  </li>
                  <li>
                    <strong>Risk Profile (10%):</strong> Compatibility in risk tolerance and
                    management approach
                  </li>
                </ul>

                <h4>Role-Specific Matching</h4>
                <p>
                  The system adapts its matching criteria based on your role:
                </p>
                <ul>
                  <li>
                    <strong>Fund Managers:</strong> Matched with LPs based on investment size,
                    track record, and fund capacity
                  </li>
                  <li>
                    <strong>Limited Partners:</strong> Matched with opportunities meeting their
                    investment criteria and return expectations
                  </li>
                  <li>
                    <strong>Capital Raisers:</strong> Matched based on deal size alignment and
                    sector expertise
                  </li>
                </ul>

                <h4>Understanding Match Quality</h4>
                <p>
                  Each match includes three key indicators:
                </p>
                <ul>
                  <li>
                    <strong>Match Percentage:</strong> Overall compatibility score based on
                    weighted criteria
                  </li>
                  <li>
                    <strong>Compatibility Factors:</strong> Specific areas where profiles align
                    (e.g., "Fund size meets minimum investment criteria")
                  </li>
                  <li>
                    <strong>Potential Synergies:</strong> Opportunities for collaboration
                    (e.g., "Direct investment opportunities", "Mentorship potential")
                  </li>
                </ul>

                <h4>Optimizing Your Matches</h4>
                <p>
                  Customize your matching preferences to find the most relevant partners:
                </p>
                <ul>
                  <li>
                    <strong>Role Filtering:</strong> Choose which types of partners you want to
                    match with
                  </li>
                  <li>
                    <strong>Match Threshold:</strong> Set minimum match percentage requirements
                  </li>
                  <li>
                    <strong>Previous Matches:</strong> Option to exclude previously matched
                    partners
                  </li>
                  <li>
                    <strong>Results Limit:</strong> Control the number of matches you receive
                  </li>
                </ul>

                <div className="not-prose">
                  <Button variant="outline" className="mt-4">
                    <Settings className="h-4 w-4 mr-2" /> Adjust Matching Preferences
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Communication */}
          <section id="communication" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">Communication Tools</h2>
            <Card className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>Connecting with Matches</h3>
                <p>
                  InvestMatch provides several ways to communicate with your
                  matches:
                </p>

                <h4>Available Tools</h4>
                <ul>
                  <li>
                    <strong>Direct Messaging:</strong> Secure, real-time
                    communication
                  </li>
                  <li>
                    <strong>Meeting Scheduler:</strong> Coordinate meetings with
                    calendar integration
                  </li>
                  <li>
                    <strong>Document Sharing:</strong> Share important files
                    securely
                  </li>
                  <li>
                    <strong>Introduction Requests:</strong> Facilitate
                    introductions through mutual connections
                  </li>
                </ul>
              </div>
            </Card>
          </section>

          {/* Analytics */}
          <section id="analytics" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">
              Analytics & Reporting
            </h2>
            <Card className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>Track Your Success</h3>
                <p>
                  Monitor your activity and success metrics through our
                  comprehensive analytics dashboard:
                </p>

                <h4>Available Metrics</h4>
                <ul>
                  <li>Profile views and engagement rates</li>
                  <li>Match quality and success rates</li>
                  <li>Communication activity</li>
                  <li>Network growth and connections</li>
                </ul>

                <h4>Custom Reports</h4>
                <p>
                  Export custom reports for your specific needs, including match
                  history, communication logs, and success metrics.
                </p>
              </div>
            </Card>
          </section>

          {/* Contact Management */}
          <section id="contact-management" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Management</h2>
            <Card className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>Managing Your Network</h3>
                <p>
                  Efficiently manage your professional network and facilitate
                  valuable connections:
                </p>

                <h4>Features</h4>
                <ul>
                  <li>
                    <strong>Import Contacts:</strong> Upload your existing
                    network
                  </li>
                  <li>
                    <strong>Global Matching:</strong> Enable matching for your
                    contacts
                  </li>
                  <li>
                    <strong>Track Connections:</strong> Monitor introduction and
                    success rates
                  </li>
                  <li>
                    <strong>Network Insights:</strong> Analyze your network's
                    strength and gaps
                  </li>
                </ul>
              </div>
            </Card>
          </section>

          {/* Settings */}
          <section id="settings" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">
              Settings & Preferences
            </h2>
            <Card className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>Customize Your Experience</h3>
                <p>
                  Configure your account settings and preferences to optimize
                  your InvestMatch experience:
                </p>

                <h4>Available Settings</h4>
                <ul>
                  <li>
                    <strong>Privacy Controls:</strong> Manage your visibility
                    and data sharing
                  </li>
                  <li>
                    <strong>Notification Preferences:</strong> Configure email
                    and in-app notifications
                  </li>
                  <li>
                    <strong>Matching Preferences:</strong> Fine-tune your
                    matching criteria
                  </li>
                  <li>
                    <strong>Account Management:</strong> Update your
                    subscription and billing
                  </li>
                </ul>
              </div>
            </Card>
          </section>

          {/* Privacy */}
          <section id="privacy" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">Privacy & Data Protection</h2>
            <PrivacyGuide />
          </section>

          {/* Support */}
          <section id="support" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">Support</h2>
            <Card className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>Getting Help</h3>
                <p>
                  Need assistance? Our support system is here to help you get the most out of
                  InvestMatch. Before creating a support ticket, check our knowledge base for
                  instant answers to common questions.
                </p>

                <div className="not-prose flex gap-4 mt-6">
                  <Button
                    onClick={() => navigate("/CreateTicket")}
                    className="flex items-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" /> Create Support Ticket
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/TicketList")}
                    className="flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" /> View Your Tickets
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">
              Frequently Asked Questions
            </h2>
            <Card className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    How does the matching algorithm work?
                  </AccordionTrigger>
                  <AccordionContent>
                    Our matching algorithm considers multiple factors including
                    investment focus, fund size, risk tolerance, and historical
                    performance to create accurate matches. Each match is scored
                    based on the alignment of these criteria between users.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    How can I improve my match quality?
                  </AccordionTrigger>
                  <AccordionContent>
                    To improve match quality: 1) Complete your profile with
                    detailed information, 2) Keep your information up-to-date,
                    3) Be specific about your investment criteria and
                    preferences, and 4) Regularly review and update your
                    matching preferences.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    What verification documents are required?
                  </AccordionTrigger>
                  <AccordionContent>
                    Required documents vary by user role. Fund Managers need to
                    provide fund management credentials, Limited Partners need
                    to verify accredited investor status, and Capital Raisers
                    need to provide professional credentials and references.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    How secure is my information?
                  </AccordionTrigger>
                  <AccordionContent>
                    We employ enterprise-grade security measures to protect your
                    data. This includes encryption at rest and in transit,
                    secure document storage, and strict access controls. We
                    comply with international privacy regulations and regularly
                    audit our security measures.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>
                    What are the subscription options?
                  </AccordionTrigger>
                  <AccordionContent>
                    We offer flexible subscription tiers with 3, 6, or 9-month
                    free trial options. Each tier includes different features
                    and capabilities. Contact our sales team for detailed
                    pricing information and to find the best plan for your
                    needs.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
