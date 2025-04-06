import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { RiskCategory, RiskSeverity, ComplianceCategory } from "../utils/enums";
import { PatternMatchResult, RiskScore } from "../utils/moderationTypes";
import {
  AlertCircle,
  Check,
  CheckCircle,
  FileBox,
  FileText,
  HelpCircle,
  Info,
  MessageCircle,
  Pencil,
  PlusCircle,
  RefreshCw,
  Save,
  Shield,
  User,
} from "lucide-react";

/**
 * Content Classification Result Interface
 */
interface ContentClassification {
  contentType: "profile" | "message" | "document" | "comment" | "unknown";
  complianceCategory: ComplianceCategory;
  complianceScore: number;
  detectedEntities: string[];
  sensitiveDataTypes: string[];
  regulatoryFlags: {
    category: string;
    description: string;
    severity: RiskSeverity;
  }[];
  tokens: number;
  classificationConfidence: number;
  timestamp: string;
}

/**
 * Props for ContentClassifier component
 */
interface Props {
  token: { idToken: string };
  onClassificationComplete?: (classification: ContentClassification) => void;
  initialContent?: string;
}

/**
 * ContentClassifier component - Automatically classifies content and assesses compliance risks
 */
export function ContentClassifier({ token, onClassificationComplete, initialContent = "" }: Props) {
  // State for the content input
  const [content, setContent] = useState<string>(initialContent);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [classification, setClassification] = useState<ContentClassification | null>(null);
  const [classificationHistory, setClassificationHistory] = useState<ContentClassification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("classifier");
  const [autoClassifyEnabled, setAutoClassifyEnabled] = useState<boolean>(true);
  const [selectedComplianceCategory, setSelectedComplianceCategory] = useState<ComplianceCategory>(ComplianceCategory.STANDARD);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  // Color scheme for visualization
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#c13a39'];
  const SEVERITY_COLORS = {
    [RiskSeverity.LOW]: '#4ade80',
    [RiskSeverity.MEDIUM]: '#facc15',
    [RiskSeverity.HIGH]: '#f97316',
    [RiskSeverity.CRITICAL]: '#ef4444',
  };
  
  // When content changes, auto-classify if enabled
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (autoClassifyEnabled && content.trim().length > 20) {
      timeoutId = setTimeout(() => {
        classifyContent();
      }, 1000); // Wait for 1 second after typing stops
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [content, autoClassifyEnabled]);

  // Function to determine content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "profile":
        return <User className="h-5 w-5 text-blue-500" />;
      case "message":
        return <MessageCircle className="h-5 w-5 text-green-500" />;
      case "document":
        return <FileText className="h-5 w-5 text-amber-500" />;
      case "comment":
        return <Pencil className="h-5 w-5 text-purple-500" />;
      default:
        return <FileBox className="h-5 w-5 text-gray-500" />;
    }
  };

  // Function to get description for compliance categories
  const getComplianceCategoryDescription = (category: ComplianceCategory): string => {
    switch (category) {
      case ComplianceCategory.GDPR:
        return "Personal data protected under European privacy regulations";
      case ComplianceCategory.COPPA:
        return "Children's privacy protection requirements";
      case ComplianceCategory.HIPAA:
        return "Healthcare information privacy standards";
      case ComplianceCategory.FINANCIAL:
        return "Financial regulations including investment advice";
      case ComplianceCategory.STANDARD:
      default:
        return "General compliance standards and best practices";
    }
  };

  // Classify content
  const classifyContent = useCallback(async () => {
    if (!content.trim()) {
      toast.warning("Please enter content to classify");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call an API to classify the content
      // For now, we'll simulate a response
      
      // First, detect the content type based on patterns
      let detectedContentType: "profile" | "message" | "document" | "comment" | "unknown" = "unknown";
      
      if (content.includes("fund") || content.includes("investment") || content.includes("portfolio")) {
        detectedContentType = "profile";
      } else if (content.includes("Hi") || content.includes("Hello") || content.includes("?\n")) {
        detectedContentType = "message";
      } else if (content.includes("report") || content.includes("analysis") || content.length > 500) {
        detectedContentType = "document";
      } else if (content.includes("reply") || content.length < 200) {
        detectedContentType = "comment";
      }
      
      // Detect entities
      const detectedEntities = extractEntities(content);
      
      // Detect sensitive data
      const sensitiveDataTypes = detectSensitiveData(content);
      
      // Generate regulatory flags
      const regulatoryFlags = generateRegulatoryFlags(content, selectedComplianceCategory);
      
      // Calculate compliance score (0-100)
      let baseComplianceScore = 80; // Start with a good score
      
      // Reduce score based on sensitive data
      baseComplianceScore -= sensitiveDataTypes.length * 10;
      
      // Reduce score based on regulatory flags severity
      regulatoryFlags.forEach(flag => {
        if (flag.severity === RiskSeverity.CRITICAL) {
          baseComplianceScore -= 30;
        } else if (flag.severity === RiskSeverity.HIGH) {
          baseComplianceScore -= 20;
        } else if (flag.severity === RiskSeverity.MEDIUM) {
          baseComplianceScore -= 10;
        } else if (flag.severity === RiskSeverity.LOW) {
          baseComplianceScore -= 5;
        }
      });
      
      // Ensure score is between 0 and 100
      const complianceScore = Math.max(0, Math.min(100, baseComplianceScore));
      
      // Calculate classification confidence
      const classificationConfidence = 0.7 + Math.random() * 0.3; // Between 70% and 100%
      
      // Build the classification result
      const result: ContentClassification = {
        contentType: detectedContentType,
        complianceCategory: selectedComplianceCategory,
        complianceScore,
        detectedEntities,
        sensitiveDataTypes,
        regulatoryFlags,
        tokens: Math.round(content.length / 4),
        classificationConfidence: Math.round(classificationConfidence * 100),
        timestamp: new Date().toISOString()
      };
      
      setClassification(result);
      
      // Add to history
      setClassificationHistory(prev => [result, ...prev.slice(0, 9)]);
      
      // Notify parent if callback provided
      if (onClassificationComplete) {
        onClassificationComplete(result);
      }
      
      // Show toast notification based on compliance score
      if (complianceScore < 50) {
        toast.error(`High compliance risk detected (${complianceScore}/100)`);
      } else if (complianceScore < 70) {
        toast.warning(`Moderate compliance risk detected (${complianceScore}/100)`);
      } else {
        toast.success(`Low compliance risk detected (${complianceScore}/100)`);
      }
      
    } catch (error) {
      console.error("Error classifying content:", error);
      toast.error("Failed to classify content");
    } finally {
      setIsLoading(false);
    }
  }, [content, selectedComplianceCategory, onClassificationComplete]);
  
  // Extract entities from content
  const extractEntities = (text: string): string[] => {
    const entities: string[] = [];
    
    // Simple pattern matching for demonstration purposes
    // In a real app, this would use a more sophisticated NLP approach
    
    // Look for email addresses
    const emailRegex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailRegex) || [];
    
    // Look for phone numbers
    const phoneRegex = /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g;
    const phones = text.match(phoneRegex) || [];
    
    // Look for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    
    // Look for dollar amounts
    const moneyRegex = /\$\d+(,\d{3})*(\.\d{2})?/g;
    const money = text.match(moneyRegex) || [];
    
    // Look for percentages
    const percentRegex = /\d+(\.\d+)?\s?%/g;
    const percentages = text.match(percentRegex) || [];
    
    // Add all found entities
    entities.push(...emails, ...phones, ...urls, ...money, ...percentages);
    
    // Look for potential company names (simplified for demo)
    const companyPattern = /(Inc\.|LLC|Corp\.|Ltd\.|LLP|Capital|Holdings|Fund)/g;
    const potentialCompanies = text.match(companyPattern) || [];
    entities.push(...potentialCompanies);
    
    // Look for potential people names (simplified)
    const lines = text.split(/\n|\.|\?|!/);
    for (const line of lines) {
      const words = line.split(' ');
      for (let i = 0; i < words.length - 1; i++) {
        const word = words[i].trim();
        if (word && word[0] === word[0].toUpperCase() && word.length > 1) {
          entities.push(word);
        }
      }
    }
    
    // Return unique entities
    return [...new Set(entities)];
  };
  
  // Detect sensitive data
  const detectSensitiveData = (text: string): string[] => {
    const sensitiveTypes: string[] = [];
    
    // Check for potential SSN (US Social Security Number)
    if (/\d{3}-\d{2}-\d{4}/.test(text)) {
      sensitiveTypes.push("SSN");
    }
    
    // Check for potential credit card numbers
    if (/\d{4}[- ]\d{4}[- ]\d{4}[- ]\d{4}/.test(text)) {
      sensitiveTypes.push("Credit Card");
    }
    
    // Check for potential birthdates
    if (/\b(0[1-9]|1[0-2])[/.-](0[1-9]|[12]\d|3[01])[/.-](19|20)\d{2}\b/.test(text)) {
      sensitiveTypes.push("Birthdate");
    }
    
    // Check for potential addresses
    if (/\d+\s+[A-Z][a-z]+\s+(St|Ave|Rd|Blvd|Ln|Drive|Place|Court)/.test(text)) {
      sensitiveTypes.push("Address");
    }
    
    // Check for potential bank account information
    if (/\brouting\s+number|\baccount\s+number|\biban\b/i.test(text)) {
      sensitiveTypes.push("Bank Information");
    }
    
    // Check for potential medical information
    if (/\bdiagnosis\b|\bmedical\s+condition\b|\btreatment\b|\bmedication\b/i.test(text)) {
      sensitiveTypes.push("Medical Information");
    }
    
    // Check for potential passport numbers
    if (/\bpassport\s+number\b|\bpassport\s+#\b/i.test(text)) {
      sensitiveTypes.push("Passport Number");
    }
    
    // Check for potential investment data
    if (/\binvestment\s+strategy\b|\bportfolio\s+allocation\b|\basset\s+under\s+management\b|\bAUM\b/i.test(text)) {
      sensitiveTypes.push("Investment Data");
    }
    
    // Check for potential return metrics
    if (/\bIRR\b|\bMOIC\b|\bROI\b|\breturn\s+on\s+investment\b/i.test(text)) {
      sensitiveTypes.push("Performance Metrics");
    }
    
    return sensitiveTypes;
  };
  
  // Generate regulatory flags
  const generateRegulatoryFlags = (
    text: string, 
    complianceCategory: ComplianceCategory
  ): { category: string; description: string; severity: RiskSeverity }[] => {
    const flags: { category: string; description: string; severity: RiskSeverity }[] = [];
    
    // General flags for all compliance categories
    if (/\bguaranteed\s+returns?\b|\bguaranteed\s+profit\b/i.test(text)) {
      flags.push({
        category: "Investment Claims",
        description: "Statements about guaranteed returns or profits",
        severity: RiskSeverity.CRITICAL
      });
    }
    
    if (/\brisk[-\s]free\b/i.test(text)) {
      flags.push({
        category: "Risk Disclosure",
        description: "Mentions of 'risk-free' investments",
        severity: RiskSeverity.HIGH
      });
    }
    
    if (/\bpast\s+performance\b/i.test(text) && !/\bpast\s+performance.*not.*indicative/i.test(text)) {
      flags.push({
        category: "Past Performance",
        description: "References to past performance without proper disclaimers",
        severity: RiskSeverity.MEDIUM
      });
    }
    
    // GDPR specific flags
    if (complianceCategory === ComplianceCategory.GDPR) {
      if (/\bpersonal\s+data\b|\bpersonal\s+information\b/i.test(text) && !/\bconsent\b/i.test(text)) {
        flags.push({
          category: "GDPR Consent",
          description: "References to personal data without mention of consent",
          severity: RiskSeverity.HIGH
        });
      }
      
      if (/\bdata\s+transfer\b|\btransfer.*data\b/i.test(text) && !/\bsafeguards\b/i.test(text)) {
        flags.push({
          category: "Data Transfer",
          description: "International data transfers without mention of safeguards",
          severity: RiskSeverity.MEDIUM
        });
      }
    }
    
    // COPPA specific flags
    if (complianceCategory === ComplianceCategory.COPPA) {
      if (/\bchildren\b|\bkids\b|\bminors\b/i.test(text)) {
        flags.push({
          category: "Children's Data",
          description: "References to children's data without proper safeguards",
          severity: RiskSeverity.HIGH
        });
      }
    }
    
    // HIPAA specific flags
    if (complianceCategory === ComplianceCategory.HIPAA) {
      if (/\bhealth\b|\bmedical\b|\btreatment\b/i.test(text) && !/\bphi\b|\bprotected\s+health\s+information\b/i.test(text)) {
        flags.push({
          category: "PHI",
          description: "References to health information without proper PHI safeguards",
          severity: RiskSeverity.HIGH
        });
      }
    }
    
    // Financial specific flags
    if (complianceCategory === ComplianceCategory.FINANCIAL || text.includes("investment") || text.includes("fund")) {
      if (/\bhigh[-\s]yield\b|\bhigh\s+returns?\b/i.test(text) && !/\brisks?\b/i.test(text)) {
        flags.push({
          category: "Risk Disclosure",
          description: "References to high yields without risk disclosure",
          severity: RiskSeverity.HIGH
        });
      }
      
      if (/\baccredited\s+investors?\b/i.test(text) && !/\bverification\b/i.test(text)) {
        flags.push({
          category: "Investor Verification",
          description: "References to accredited investors without verification process",
          severity: RiskSeverity.MEDIUM
        });
      }
      
      if (/\bperform(ance)?\s+fee\b|\bcarr(y|ied)\s+interest\b/i.test(text) && !/\bdisclos(e|ure)\b/i.test(text)) {
        flags.push({
          category: "Fee Disclosure",
          description: "References to performance fees without proper disclosure",
          severity: RiskSeverity.MEDIUM
        });
      }
    }
    
    return flags;
  };
  
  // Get severity badge
  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case RiskSeverity.CRITICAL:
        return <Badge variant="destructive">Critical</Badge>;
      case RiskSeverity.HIGH:
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
      case RiskSeverity.MEDIUM:
        return <Badge variant="warning">Medium</Badge>;
      case RiskSeverity.LOW:
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Get compliance score level
  const getComplianceScoreLevel = (score: number): { level: string; color: string } => {
    if (score >= 80) {
      return { level: "Good", color: "#4ade80" };
    } else if (score >= 60) {
      return { level: "Moderate", color: "#facc15" };
    } else if (score >= 40) {
      return { level: "Poor", color: "#f97316" };
    } else {
      return { level: "Critical", color: "#ef4444" };
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Content Classification System</CardTitle>
        <CardDescription>
          Automatically classify content and assess compliance risks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="classifier">Classifier</TabsTrigger>
            <TabsTrigger value="results">Classification Results</TabsTrigger>
            <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
            <TabsTrigger value="severity-scoring">Severity Scoring</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          {/* Classifier Tab */}
          <TabsContent value="classifier" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="content">Content to Classify</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter text content to classify..."
                    className="min-h-[200px]"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-classify"
                    checked={autoClassifyEnabled}
                    onCheckedChange={setAutoClassifyEnabled}
                  />
                  <Label htmlFor="auto-classify">Auto-classify (after 1 second of inactivity)</Label>
                </div>
                
                <Button
                  onClick={classifyContent}
                  disabled={isLoading || !content.trim()}
                  className="w-full"
                >
                  {isLoading ? "Classifying..." : "Classify Content"}
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="compliance-category">Compliance Framework</Label>
                  <Select
                    value={selectedComplianceCategory}
                    onValueChange={(value) => setSelectedComplianceCategory(value as ComplianceCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a compliance framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ComplianceCategory.STANDARD}>Standard</SelectItem>
                      <SelectItem value={ComplianceCategory.FINANCIAL}>Financial Regulations</SelectItem>
                      <SelectItem value={ComplianceCategory.GDPR}>GDPR</SelectItem>
                      <SelectItem value={ComplianceCategory.HIPAA}>HIPAA</SelectItem>
                      <SelectItem value={ComplianceCategory.COPPA}>COPPA</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {getComplianceCategoryDescription(selectedComplianceCategory)}
                  </p>
                </div>
                
                <div className="text-sm">
                  <Button
                    variant="outline"
                    className="w-full mb-2 justify-start"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    <span className="mr-2">{showAdvancedOptions ? "-" : "+"}</span>
                    Advanced Options
                  </Button>
                  
                  {showAdvancedOptions && (
                    <div className="space-y-3 p-3 border rounded-md">
                      {/* This would contain advanced options in a real implementation */}
                      <div className="space-y-1">
                        <Label htmlFor="entity-extraction" className="text-xs">Entity Extraction</Label>
                        <div className="flex items-center space-x-2">
                          <Switch id="entity-extraction" checked={true} />
                          <span className="text-xs text-muted-foreground">Identify names, organizations, locations</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="regulatory-scanning" className="text-xs">Regulatory Scanning</Label>
                        <div className="flex items-center space-x-2">
                          <Switch id="regulatory-scanning" checked={true} />
                          <span className="text-xs text-muted-foreground">Check for regulatory compliance issues</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="sensitive-data" className="text-xs">Sensitive Data Detection</Label>
                        <div className="flex items-center space-x-2">
                          <Switch id="sensitive-data" checked={true} />
                          <span className="text-xs text-muted-foreground">Identify PII and sensitive information</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Classification Tips</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 text-sm">
                      <li>Content is analyzed against selected compliance framework</li>
                      <li>Entity extraction identifies names, organizations, and locations</li>
                      <li>Classification confidence improves with more content</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
          
          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Compliance Framework Configuration</CardTitle>
                  <CardDescription>
                    Select and customize compliance frameworks for regulatory requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Active Compliance Frameworks</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="gdpr" defaultChecked />
                          <Label htmlFor="gdpr">GDPR</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="hipaa" />
                          <Label htmlFor="hipaa">HIPAA</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="financial" defaultChecked />
                          <Label htmlFor="financial">Financial Regulations</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="coppa" />
                          <Label htmlFor="coppa">COPPA</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Default Compliance Framework</Label>
                      <Select
                        value={selectedComplianceCategory}
                        onValueChange={(value) => setSelectedComplianceCategory(value as ComplianceCategory)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select default framework" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ComplianceCategory.STANDARD}>Standard</SelectItem>
                          <SelectItem value={ComplianceCategory.FINANCIAL}>Financial Regulations</SelectItem>
                          <SelectItem value={ComplianceCategory.GDPR}>GDPR</SelectItem>
                          <SelectItem value={ComplianceCategory.HIPAA}>HIPAA</SelectItem>
                          <SelectItem value={ComplianceCategory.COPPA}>COPPA</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {getComplianceCategoryDescription(selectedComplianceCategory)}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Compliance Score Thresholds</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Minimum Acceptable Score:</span>
                          <span className="font-medium">70</span>
                        </div>
                        <input type="range" min="0" max="100" defaultValue="70" className="w-full" />
                        <p className="text-xs text-muted-foreground">
                          Content with scores below this threshold will be flagged for review
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Save Compliance Settings</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Regulatory Guidelines</CardTitle>
                  <CardDescription>
                    Key requirements for each compliance framework
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[320px] overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-base flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-blue-50">GDPR</Badge>
                        <span>General Data Protection Regulation</span>
                      </h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Explicit consent for personal data processing</li>
                        <li>Right to access and erasure of personal data</li>
                        <li>Data breach notification requirements</li>
                        <li>Data minimization and purpose limitation</li>
                        <li>Special protection for sensitive personal data</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-base flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-green-50">Financial</Badge>
                        <span>Financial Regulations</span>
                      </h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Accurate disclosure of investment risks</li>
                        <li>No guarantees of investment returns</li>
                        <li>Clear fee structure disclosure</li>
                        <li>Accredited investor verification</li>
                        <li>Anti-money laundering (AML) compliance</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-base flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-purple-50">HIPAA</Badge>
                        <span>Health Insurance Portability and Accountability Act</span>
                      </h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Protection of protected health information (PHI)</li>
                        <li>Secure storage and transmission of health data</li>
                        <li>Patient rights to access health records</li>
                        <li>Business associate agreements</li>
                        <li>Breach notification requirements</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-base flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-yellow-50">COPPA</Badge>
                        <span>Children's Online Privacy Protection Act</span>
                      </h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Parental consent for collecting data from children under 13</li>
                        <li>Clear privacy policies for children's data</li>
                        <li>Limitations on data collection from minors</li>
                        <li>Secure storage of children's information</li>
                        <li>Parental access to review or delete children's data</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Compliance Categorization System</CardTitle>
                  <CardDescription>
                    Configure how content is categorized for compliance purposes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3 border rounded-md p-3">
                        <h4 className="font-medium">Content Type Classification</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Profile Information:</span>
                            <Badge variant="outline" className="bg-blue-50">GDPR, Financial</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Messages:</span>
                            <Badge variant="outline" className="bg-green-50">Standard</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Documents:</span>
                            <Badge variant="outline" className="bg-blue-50">GDPR, Financial</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Comments:</span>
                            <Badge variant="outline" className="bg-green-50">Standard</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 border rounded-md p-3">
                        <h4 className="font-medium">Sensitive Data Types</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Personal Identifiers:</span>
                            <Badge variant="outline" className="bg-blue-50">GDPR</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Financial Data:</span>
                            <Badge variant="outline" className="bg-green-50">Financial</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Health Information:</span>
                            <Badge variant="outline" className="bg-purple-50">HIPAA</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Minor's Data:</span>
                            <Badge variant="outline" className="bg-yellow-50">COPPA</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3 space-y-3">
                      <h4 className="font-medium">Compliance Scan Configuration</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Entity Recognition</Label>
                          <Select defaultValue="comprehensive">
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="comprehensive">Comprehensive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Pattern Matching</Label>
                          <Select defaultValue="aggressive">
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conservative">Conservative</SelectItem>
                              <SelectItem value="balanced">Balanced</SelectItem>
                              <SelectItem value="aggressive">Aggressive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm">Scan Frequency</Label>
                          <Select defaultValue="real-time">
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="on-demand">On-demand</SelectItem>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="real-time">Real-time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Reset to Defaults</Button>
                  <Button>Save Configuration</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            {classification ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Classification Results</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">Classification Confidence:</p>
                    <Badge variant="outline">{classification.classificationConfidence}%</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Content Type Card */}
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-base">Content Classification</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getContentTypeIcon(classification.contentType)}
                          <span className="font-medium capitalize">{classification.contentType} Content</span>
                        </div>
                        <Badge className="capitalize">{classification.complianceCategory.toLowerCase()}</Badge>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">Compliance Score:</p>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full" 
                                    style={{ backgroundColor: getComplianceScoreLevel(classification.complianceScore).color, color: 'white' }}>
                                {getComplianceScoreLevel(classification.complianceScore).level}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block">
                                {classification.complianceScore}/100
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-gray-200">
                            <div style={{ 
                              width: `${classification.complianceScore}%`,
                              backgroundColor: getComplianceScoreLevel(classification.complianceScore).color
                            }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Stats Card */}
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-base">Content Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Tokens</p>
                          <p className="text-lg font-medium">{classification.tokens}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Entities Detected</p>
                          <p className="text-lg font-medium">{classification.detectedEntities.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sensitive Data Types</p>
                          <p className="text-lg font-medium">{classification.sensitiveDataTypes.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Regulatory Flags</p>
                          <p className="text-lg font-medium">{classification.regulatoryFlags.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Separator />
                
                {/* Regulatory Flags */}
                <div className="space-y-2">
                  <h4 className="font-medium text-base">Regulatory Flags</h4>
                  {classification.regulatoryFlags.length > 0 ? (
                    <div className="space-y-2">
                      {classification.regulatoryFlags.map((flag, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 border rounded">
                          {getSeverityBadge(flag.severity)}
                          <div>
                            <p className="font-medium">{flag.category}</p>
                            <p className="text-sm text-muted-foreground">{flag.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p>No regulatory flags detected.</p>
                    </div>
                  )}
                </div>
                
                {/* Detected Entities */}
                <div className="space-y-2">
                  <h4 className="font-medium text-base">Detected Entities</h4>
                  {classification.detectedEntities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {classification.detectedEntities.map((entity, index) => (
                        <Badge key={index} variant="outline">{entity}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No entities detected</p>
                  )}
                </div>
                
                {/* Sensitive Data Types */}
                <div className="space-y-2">
                  <h4 className="font-medium text-base">Sensitive Data Types</h4>
                  {classification.sensitiveDataTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {classification.sensitiveDataTypes.map((type, index) => (
                        <Badge key={index} variant="secondary">{type}</Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <Shield className="h-5 w-5 text-green-500" />
                      <p>No sensitive data types detected.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No classification results yet. Classify content to see results here.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Severity Scoring Tab */}
          <TabsContent value="severity-scoring" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Severity Scoring Configuration</CardTitle>
                  <CardDescription>
                    Configure how content is analyzed and scored for risk severity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Risk Factor Weights</Label>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Sensitive Data Presence:</span>
                            <span className="text-sm font-medium">30%</span>
                          </div>
                          <input type="range" min="0" max="100" defaultValue="30" className="w-full" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Regulatory Compliance Issues:</span>
                            <span className="text-sm font-medium">40%</span>
                          </div>
                          <input type="range" min="0" max="100" defaultValue="40" className="w-full" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Content Type Risk:</span>
                            <span className="text-sm font-medium">20%</span>
                          </div>
                          <input type="range" min="0" max="100" defaultValue="20" className="w-full" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Context & Entity Risk:</span>
                            <span className="text-sm font-medium">10%</span>
                          </div>
                          <input type="range" min="0" max="100" defaultValue="10" className="w-full" />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Severity Level Thresholds</Label>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-3 h-3 mr-2 rounded-full bg-red-500"></div>
                              <span className="text-sm">Critical Risk Threshold:</span>
                            </div>
                            <span className="text-sm font-medium">80</span>
                          </div>
                          <input type="range" min="0" max="100" defaultValue="80" className="w-full" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-3 h-3 mr-2 rounded-full bg-orange-500"></div>
                              <span className="text-sm">High Risk Threshold:</span>
                            </div>
                            <span className="text-sm font-medium">60</span>
                          </div>
                          <input type="range" min="0" max="100" defaultValue="60" className="w-full" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-3 h-3 mr-2 rounded-full bg-yellow-400"></div>
                              <span className="text-sm">Medium Risk Threshold:</span>
                            </div>
                            <span className="text-sm font-medium">40</span>
                          </div>
                          <input type="range" min="0" max="100" defaultValue="40" className="w-full" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-3 h-3 mr-2 rounded-full bg-green-500"></div>
                              <span className="text-sm">Low Risk Threshold:</span>
                            </div>
                            <span className="text-sm font-medium">20</span>
                          </div>
                          <input type="range" min="0" max="100" defaultValue="20" className="w-full" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full">Apply Severity Configuration</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Severity Scoring Model</CardTitle>
                  <CardDescription>
                    How risk factors are combined to produce severity scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Scoring Algorithm</Label>
                        <Select defaultValue="weighted">
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select algorithm" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weighted">Weighted Average</SelectItem>
                            <SelectItem value="max">Maximum Factor</SelectItem>
                            <SelectItem value="dynamic">Dynamic Scaling</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="rounded-md border p-4 pt-0 mt-4">
                        <div className="flex gap-2 -mt-3">
                          <Badge variant="outline" className="bg-blue-50 -mt-px">Weighted Average</Badge>
                        </div>
                        <p className="text-sm mt-2">
                          Calculates severity by combining all risk factors according to their configured weights. Most balanced approach that considers all aspects of content risk.
                        </p>
                        
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-xs font-mono">Score = (SensitiveData × 0.3) + (Regulatory × 0.4) + (ContentType × 0.2) + (Context × 0.1)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Risk Factor Amplifiers</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="pii-amplifier" defaultChecked />
                          <Label htmlFor="pii-amplifier" className="text-sm">PII Detection</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="financial-amplifier" defaultChecked />
                          <Label htmlFor="financial-amplifier" className="text-sm">Financial Data</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="context-amplifier" />
                          <Label htmlFor="context-amplifier" className="text-sm">Context Analysis</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="historical-amplifier" defaultChecked />
                          <Label htmlFor="historical-amplifier" className="text-sm">Historical Patterns</Label>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Amplifiers increase the weight of specific risk factors when detected
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Automated Severity Scoring</CardTitle>
                  <CardDescription>
                    Preview how content would be scored with current configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {classification ? (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center justify-center p-4">
                        <div className="relative h-32 w-32">
                          <svg className="w-32 h-32" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="1"
                              strokeDasharray="100, 100"
                            />
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={getComplianceScoreLevel(classification.complianceScore).color}
                              strokeWidth="3"
                              strokeDasharray={`${classification.complianceScore}, 100`}
                              strokeLinecap="round"
                            />
                            <text x="18" y="20.5" className="text-xl font-bold" textAnchor="middle" fill="currentColor">
                              {classification.complianceScore}
                            </text>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{classification.complianceScore}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <Badge
                            style={{ backgroundColor: getComplianceScoreLevel(classification.complianceScore).color }}
                            className="text-white px-3 py-1"
                          >
                            {getComplianceScoreLevel(classification.complianceScore).level} Risk Level
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="font-medium">Risk Factor Breakdown</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1 text-sm">
                                <span>Sensitive Data:</span>
                                <span>{Math.min(100, classification.sensitiveDataTypes.length * 25)}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500" 
                                  style={{ width: `${Math.min(100, classification.sensitiveDataTypes.length * 25)}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1 text-sm">
                                <span>Regulatory Issues:</span>
                                <span>
                                  {classification.regulatoryFlags.reduce((score, flag) => {
                                    const severityScores = {
                                      [RiskSeverity.CRITICAL]: 25,
                                      [RiskSeverity.HIGH]: 15,
                                      [RiskSeverity.MEDIUM]: 10,
                                      [RiskSeverity.LOW]: 5
                                    };
                                    return score + (severityScores[flag.severity] || 0);
                                  }, 0)}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-orange-500" 
                                  style={{ 
                                    width: `${classification.regulatoryFlags.reduce((score, flag) => {
                                      const severityScores = {
                                        [RiskSeverity.CRITICAL]: 25,
                                        [RiskSeverity.HIGH]: 15,
                                        [RiskSeverity.MEDIUM]: 10,
                                        [RiskSeverity.LOW]: 5
                                      };
                                      return score + (severityScores[flag.severity] || 0);
                                    }, 0)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1 text-sm">
                                <span>Content Type Risk:</span>
                                <span>
                                  {(() => {
                                    const contentTypeRisks = {
                                      "profile": 60,
                                      "document": 70,
                                      "message": 40,
                                      "comment": 50,
                                      "unknown": 30
                                    };
                                    return contentTypeRisks[classification.contentType] || 30;
                                  })()}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-purple-500" 
                                  style={{ 
                                    width: `${(() => {
                                      const contentTypeRisks = {
                                        "profile": 60,
                                        "document": 70,
                                        "message": 40,
                                        "comment": 50,
                                        "unknown": 30
                                      };
                                      return contentTypeRisks[classification.contentType] || 30;
                                    })()}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1 text-sm">
                                <span>Entity Context:</span>
                                <span>{Math.min(100, classification.detectedEntities.length * 10)}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500" 
                                  style={{ width: `${Math.min(100, classification.detectedEntities.length * 10)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Severity Distributions</h4>
                          <div className="h-[180px]">
                            {classification.regulatoryFlags.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={[
                                    {
                                      name: "Critical",
                                      value: classification.regulatoryFlags.filter(f => f.severity === RiskSeverity.CRITICAL).length,
                                      fill: SEVERITY_COLORS[RiskSeverity.CRITICAL]
                                    },
                                    {
                                      name: "High",
                                      value: classification.regulatoryFlags.filter(f => f.severity === RiskSeverity.HIGH).length,
                                      fill: SEVERITY_COLORS[RiskSeverity.HIGH]
                                    },
                                    {
                                      name: "Medium",
                                      value: classification.regulatoryFlags.filter(f => f.severity === RiskSeverity.MEDIUM).length,
                                      fill: SEVERITY_COLORS[RiskSeverity.MEDIUM]
                                    },
                                    {
                                      name: "Low",
                                      value: classification.regulatoryFlags.filter(f => f.severity === RiskSeverity.LOW).length,
                                      fill: SEVERITY_COLORS[RiskSeverity.LOW]
                                    },
                                  ]}
                                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="value" nameKey="name">
                                    {[
                                      <Cell key="cell-0" fill={SEVERITY_COLORS[RiskSeverity.CRITICAL]} />,
                                      <Cell key="cell-1" fill={SEVERITY_COLORS[RiskSeverity.HIGH]} />,
                                      <Cell key="cell-2" fill={SEVERITY_COLORS[RiskSeverity.MEDIUM]} />,
                                      <Cell key="cell-3" fill={SEVERITY_COLORS[RiskSeverity.LOW]} />,
                                    ]}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                  <p>No severity issues detected</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No content has been classified yet. Classify content to see severity scoring.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="w-full text-sm text-muted-foreground">
                    <p>Severity scores are calculated based on weighted risk factors from content analysis</p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Visualizations Tab */}
          <TabsContent value="visualizations" className="space-y-4">
            {classification ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Compliance Score Gauge */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Compliance Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center">
                        <div className="relative h-32 w-32 flex items-center justify-center">
                          <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle
                              cx="60"
                              cy="60"
                              r="54"
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth="12"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="54"
                              fill="none"
                              stroke={getComplianceScoreLevel(classification.complianceScore).color}
                              strokeWidth="12"
                              strokeDasharray="339.3"  
                              strokeDashoffset={`${339.3 * (1 - classification.complianceScore / 100)}`}
                              transform="rotate(-90 60 60)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <span className="text-3xl font-bold">{classification.complianceScore}</span>
                              <span className="text-xs">/100</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <Badge 
                          style={{ backgroundColor: getComplianceScoreLevel(classification.complianceScore).color }}
                          className="mx-auto mt-2"
                        >
                          {getComplianceScoreLevel(classification.complianceScore).level} Compliance
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Regulatory Flags by Severity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Regulatory Flags by Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        {classification.regulatoryFlags.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: "Critical",
                                    value: classification.regulatoryFlags.filter(f => f.severity === RiskSeverity.CRITICAL).length,
                                  },
                                  {
                                    name: "High",
                                    value: classification.regulatoryFlags.filter(f => f.severity === RiskSeverity.HIGH).length,
                                  },
                                  {
                                    name: "Medium",
                                    value: classification.regulatoryFlags.filter(f => f.severity === RiskSeverity.MEDIUM).length,
                                  },
                                  {
                                    name: "Low",
                                    value: classification.regulatoryFlags.filter(f => f.severity === RiskSeverity.LOW).length,
                                  },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                <Cell key={`cell-0`} fill={SEVERITY_COLORS[RiskSeverity.CRITICAL]} />
                                <Cell key={`cell-1`} fill={SEVERITY_COLORS[RiskSeverity.HIGH]} />
                                <Cell key={`cell-2`} fill={SEVERITY_COLORS[RiskSeverity.MEDIUM]} />
                                <Cell key={`cell-3`} fill={SEVERITY_COLORS[RiskSeverity.LOW]} />
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
                              <p>No regulatory flags detected</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Entities & Sensitive Data Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Content Analysis Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: "Entities",
                              count: classification.detectedEntities.length,
                            },
                            {
                              name: "Sensitive Data",
                              count: classification.sensitiveDataTypes.length,
                            },
                            {
                              name: "Regulatory Flags",
                              count: classification.regulatoryFlags.length,
                            },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8">
                            <Cell fill={"#0088FE"} />
                            <Cell fill={"#00C49F"} />
                            <Cell fill={"#FFBB28"} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No data to visualize. Classify content to see visualizations.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Severity Scoring Tab - NEW */}
          <TabsContent value="severity-scoring" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Severity Score Configuration</CardTitle>
                <CardDescription>
                  Configure how severity scores are calculated for different content types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Base Score Adjustments</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between space-x-4">
                        <div>
                          <h4 className="font-medium text-sm">Sensitive Data Impact</h4>
                          <p className="text-xs text-muted-foreground">Score reduction per sensitive data type</p>
                        </div>
                        <div className="w-32">
                          <Select defaultValue="10">
                            <SelectTrigger>
                              <SelectValue placeholder="Select impact" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">Low (-5)</SelectItem>
                              <SelectItem value="10">Medium (-10)</SelectItem>
                              <SelectItem value="15">High (-15)</SelectItem>
                              <SelectItem value="20">Severe (-20)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between space-x-4">
                        <div>
                          <h4 className="font-medium text-sm">Starting Baseline</h4>
                          <p className="text-xs text-muted-foreground">Default score before adjustments</p>
                        </div>
                        <div className="w-32">
                          <Select defaultValue="80">
                            <SelectTrigger>
                              <SelectValue placeholder="Select baseline" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="70">Conservative (70)</SelectItem>
                              <SelectItem value="80">Standard (80)</SelectItem>
                              <SelectItem value="90">Permissive (90)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Severity Weights by Category</Label>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Critical:</span>
                          <Badge variant="destructive">-30 points</Badge>
                        </div>
                        <input type="range" min="10" max="50" defaultValue="30" className="w-full" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">High:</span>
                          <Badge variant="destructive" className="bg-orange-500">-20 points</Badge>
                        </div>
                        <input type="range" min="5" max="30" defaultValue="20" className="w-full" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Medium:</span>
                          <Badge variant="warning">-10 points</Badge>
                        </div>
                        <input type="range" min="1" max="20" defaultValue="10" className="w-full" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Low:</span>
                          <Badge variant="secondary">-5 points</Badge>
                        </div>
                        <input type="range" min="1" max="10" defaultValue="5" className="w-full" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Content Type Modifiers</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Profile Content:</span>
                        </div>
                        <Select defaultValue="1.0">
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Modifier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.8">0.8x (Lenient)</SelectItem>
                            <SelectItem value="1.0">1.0x (Standard)</SelectItem>
                            <SelectItem value="1.2">1.2x (Strict)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Message Content:</span>
                        </div>
                        <Select defaultValue="1.0">
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Modifier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.8">0.8x (Lenient)</SelectItem>
                            <SelectItem value="1.0">1.0x (Standard)</SelectItem>
                            <SelectItem value="1.2">1.2x (Strict)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">Document Content:</span>
                        </div>
                        <Select defaultValue="1.0">
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Modifier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.8">0.8x (Lenient)</SelectItem>
                            <SelectItem value="1.0">1.0x (Standard)</SelectItem>
                            <SelectItem value="1.2">1.2x (Strict)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pencil className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Comment Content:</span>
                        </div>
                        <Select defaultValue="1.0">
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Modifier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.8">0.8x (Lenient)</SelectItem>
                            <SelectItem value="1.0">1.0x (Standard)</SelectItem>
                            <SelectItem value="1.2">1.2x (Strict)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Configuration</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Severity Scoring System</CardTitle>
                <CardDescription>
                  How automated severity scoring works and affects content moderation
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Scoring Algorithm</h3>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <pre className="text-xs whitespace-pre-wrap">
                        <code>
                          {`// Pseudo-code for severity scoring algorithm
function calculateComplianceScore(content, config) {
  // Start with baseline score (typically 80-100)
  let score = config.baselineScore;
  
  // Reduce score based on sensitive data types found
  score -= detectSensitiveData(content).length * config.sensitiveDataImpact;
  
  // Apply reductions based on regulatory flag severity
  const flags = detectRegulatoryFlags(content);
  for (const flag of flags) {
    score -= getSeverityPenalty(flag.severity);
  }
  
  // Apply content type modifier
  score *= getContentTypeModifier(detectContentType(content));
  
  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}`}
                        </code>
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Score Interpretation</h3>
                    <div className="space-y-2">
                      <div className="p-2 rounded-md border-l-4" style={{ borderLeftColor: "#4ade80" }}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">80-100: Good</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Content meets compliance standards with minimal concerns.</p>
                      </div>
                      <div className="p-2 rounded-md border-l-4" style={{ borderLeftColor: "#facc15" }}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">60-79: Moderate</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Content has some compliance concerns that may need attention.</p>
                      </div>
                      <div className="p-2 rounded-md border-l-4" style={{ borderLeftColor: "#f97316" }}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">40-59: Poor</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Content has significant compliance issues requiring review.</p>
                      </div>
                      <div className="p-2 rounded-md border-l-4" style={{ borderLeftColor: "#ef4444" }}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">0-39: Critical</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Content has severe compliance violations requiring immediate action.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Automated Actions</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-sm font-medium py-2 border-b">
                        <div>Score Range</div>
                        <div>Risk Level</div>
                        <div>Automated Action</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b">
                        <div>0-20</div>
                        <div>
                          <Badge variant="destructive">Critical</Badge>
                        </div>
                        <div>Auto-block, notify admin</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b">
                        <div>21-40</div>
                        <div>
                          <Badge variant="destructive" className="bg-orange-500">High</Badge>
                        </div>
                        <div>Queue for priority review</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm py-2 border-b">
                        <div>41-60</div>
                        <div>
                          <Badge variant="warning">Moderate</Badge>
                        </div>
                        <div>Queue for standard review</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm py-2">
                        <div>61-100</div>
                        <div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Low</Badge>
                        </div>
                        <div>Allow, sample for QA</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Integration with Moderation</h3>
                    <p className="text-sm text-muted-foreground">
                      The severity scoring system integrates with the broader moderation workflow:
                    </p>
                    <ul className="list-disc pl-5 text-sm mt-2 space-y-1 text-muted-foreground">
                      <li>Scores are calculated in real-time as content is submitted</li>
                      <li>Automated actions are triggered based on score thresholds</li>
                      <li>Historical scores are tracked to identify patterns and trends</li>
                      <li>Machine learning improves scoring accuracy over time</li>
                      <li>Scores factor into overall user trust levels</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Risk Scoring Configuration</CardTitle>
                  <CardDescription>
                    Configure weights for different risk factors in severity scoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Sensitive Data Weight</span>
                        <span className="text-sm text-muted-foreground">30%</span>
                      </Label>
                      <input type="range" min="0" max="100" defaultValue="30" className="w-full" />
                      <p className="text-xs text-muted-foreground">Higher values make sensitive data detection have more impact on risk scoring</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Regulatory Keywords Weight</span>
                        <span className="text-sm text-muted-foreground">40%</span>
                      </Label>
                      <input type="range" min="0" max="100" defaultValue="40" className="w-full" />
                      <p className="text-xs text-muted-foreground">Higher values make regulatory keyword matches have more impact</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Content Type Weight</span>
                        <span className="text-sm text-muted-foreground">15%</span>
                      </Label>
                      <input type="range" min="0" max="100" defaultValue="15" className="w-full" />
                      <p className="text-xs text-muted-foreground">Weight applied to different content types (profiles, messages, etc.)</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Entity Detection Weight</span>
                        <span className="text-sm text-muted-foreground">15%</span>
                      </Label>
                      <input type="range" min="0" max="100" defaultValue="15" className="w-full" />
                      <p className="text-xs text-muted-foreground">Higher values make entity detection have more impact</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Save Configuration</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Severity Thresholds</CardTitle>
                  <CardDescription>
                    Configure risk score thresholds for different severity levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Critical Risk Threshold</span>
                        <span className="ml-auto">80+</span>
                      </Label>
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        defaultValue="80" 
                        className="w-full"
                        style={{ accentColor: "#ef4444" }} 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span>High Risk Threshold</span>
                        <span className="ml-auto">60+</span>
                      </Label>
                      <input 
                        type="range" 
                        min="30" 
                        max="90" 
                        defaultValue="60" 
                        className="w-full"
                        style={{ accentColor: "#f97316" }} 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Medium Risk Threshold</span>
                        <span className="ml-auto">40+</span>
                      </Label>
                      <input 
                        type="range" 
                        min="20" 
                        max="70" 
                        defaultValue="40" 
                        className="w-full"
                        style={{ accentColor: "#facc15" }} 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Low Risk Threshold</span>
                        <span className="ml-auto">0-39</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">Scores below Medium Risk threshold are classified as Low Risk</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button variant="outline">Reset to Defaults</Button>
                  <Button>Apply Thresholds</Button>
                </CardFooter>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Real-time Risk Score Simulation</CardTitle>
                  <CardDescription>
                    Test how configuration changes affect risk scoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="mb-2 block">Sample Content</Label>
                      <Textarea 
                        placeholder="Enter or paste sample content to see how risk scoring would be applied..."
                        className="h-[120px]"
                      />
                      <div className="flex justify-end mt-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Run Simulation
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="p-4 border rounded-md h-full">
                        <h4 className="font-medium mb-2">Simulation Results</h4>
                        
                        <div className="mt-4 text-center">
                          <div className="relative inline-block">
                            <svg className="w-32 h-32">
                              <circle
                                cx="64"
                                cy="64"
                                r="60"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="8"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="60"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="8"
                                strokeDasharray="377"
                                strokeDashoffset="150"
                                transform="rotate(-90 64 64)"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                              <span className="text-3xl font-bold">62</span>
                              <span className="text-sm text-muted-foreground">Risk Score</span>
                            </div>
                          </div>
                          
                          <Badge className="mt-2" variant="outline" style={{ borderColor: "#f97316", color: "#f97316" }}>
                            High Risk
                          </Badge>
                        </div>
                        
                        <div className="mt-4 text-sm">
                          <div className="flex justify-between">
                            <span>Sensitive Data:</span>
                            <span className="font-medium">+18 points</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Regulatory Keywords:</span>
                            <span className="font-medium">+26 points</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Content Type:</span>
                            <span className="font-medium">+8 points</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Entity Detection:</span>
                            <span className="font-medium">+10 points</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Machine Learning Enhancement</CardTitle>
                  <CardDescription>
                    Enable machine learning to improve risk scoring accuracy over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="ml-enabled">Automated Learning</Label>
                          <p className="text-sm text-muted-foreground">Adjust risk scoring based on moderation actions</p>
                        </div>
                        <Switch id="ml-enabled" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="feedback-integration">Moderator Feedback Integration</Label>
                          <p className="text-sm text-muted-foreground">Use moderator feedback to improve scoring accuracy</p>
                        </div>
                        <Switch id="feedback-integration" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="false-positive-detection">False Positive Learning</Label>
                          <p className="text-sm text-muted-foreground">Automatically adjust for detected false positives</p>
                        </div>
                        <Switch id="false-positive-detection" defaultChecked />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Learning System Active</AlertTitle>
                        <AlertDescription>
                          The system has processed 1,247 moderation actions and improved scoring accuracy by approximately 18% over the past 30 days.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="p-3 border rounded-md">
                        <h4 className="font-medium mb-2">Recent Learning Insights</h4>
                        <ul className="text-sm space-y-1">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Reduced false positives for investment terminology by 24%
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Improved detection of subtle compliance issues by 15%
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Better recognition of legitimate financial discussions
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Save ML Configuration</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Compliance Tab - NEW */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Compliance Categories</CardTitle>
                  <CardDescription>
                    Configure and manage compliance categories for content moderation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium">Regulatory Compliance</span>
                        <p className="text-xs text-muted-foreground">SEC, FINRA, and regulatory standards</p>
                      </div>
                      <Switch id="regulatory-toggle" defaultChecked />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium">Legal Requirements</span>
                        <p className="text-xs text-muted-foreground">Legal disclaimers and disclosure requirements</p>
                      </div>
                      <Switch id="legal-toggle" defaultChecked />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium">Privacy Standards</span>
                        <p className="text-xs text-muted-foreground">PII, confidential information, data protection</p>
                      </div>
                      <Switch id="privacy-toggle" defaultChecked />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium">KYC/AML Standards</span>
                        <p className="text-xs text-muted-foreground">Know Your Customer and Anti-Money Laundering</p>
                      </div>
                      <Switch id="kyc-aml-toggle" defaultChecked />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium">Ethical Guidelines</span>
                        <p className="text-xs text-muted-foreground">Platform-specific ethical standards</p>
                      </div>
                      <Switch id="ethical-toggle" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between w-full">
                    <Button variant="outline" size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                    <Button size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Category Rules Association</CardTitle>
                  <CardDescription>
                    Link content rules to specific compliance categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[340px] overflow-auto">
                  <div className="space-y-4">
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Sensitive financial information</div>
                        <Badge variant="outline">Regulatory</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Detects unauthorized sharing of non-public financial data</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Link className="h-3 w-3 mr-1" />
                          Change Category
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Investment advice without disclaimer</div>
                        <Badge variant="outline">Legal</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Identifies investment recommendations without proper disclaimers</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Link className="h-3 w-3 mr-1" />
                          Change Category
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Personal contact information</div>
                        <Badge variant="outline">Privacy</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Detects sharing of personal contact information outside platform channels</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Link className="h-3 w-3 mr-1" />
                          Change Category
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Offering special terms off-platform</div>
                        <Badge variant="outline">Ethical</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Identifies attempts to circumvent platform terms and fees</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Link className="h-3 w-3 mr-1" />
                          Change Category
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Link2 className="mr-2 h-4 w-4" />
                    Link New Rule to Category
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Compliance Analytics</CardTitle>
                  <CardDescription>
                    Visualization of compliance categorization across content reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-sm mb-3">Distribution by Compliance Category</h4>
                      <div className="h-[220px] flex items-center justify-center">
                        <svg width="220" height="220" viewBox="0 0 220 220">
                          {/* Donut chart representing compliance categories */}
                          <circle cx="110" cy="110" r="80" fill="none" stroke="#E0F2FE" strokeWidth="30" />
                          
                          {/* Regulatory - 35% */}
                          <circle 
                            cx="110" 
                            cy="110" 
                            r="80" 
                            fill="none" 
                            stroke="#0EA5E9" 
                            strokeWidth="30" 
                            strokeDasharray="502" 
                            strokeDashoffset="326"
                            transform="rotate(-90 110 110)" 
                          />
                          
                          {/* Legal - 25% */}
                          <circle 
                            cx="110" 
                            cy="110" 
                            r="80" 
                            fill="none" 
                            stroke="#14B8A6" 
                            strokeWidth="30" 
                            strokeDasharray="502" 
                            strokeDashoffset="376"
                            transform="rotate(36 110 110)" 
                          />
                          
                          {/* Privacy - 20% */}
                          <circle 
                            cx="110" 
                            cy="110" 
                            r="80" 
                            fill="none" 
                            stroke="#A855F7" 
                            strokeWidth="30" 
                            strokeDasharray="502" 
                            strokeDashoffset="401"
                            transform="rotate(126 110 110)" 
                          />
                          
                          {/* Ethical - 15% */}
                          <circle 
                            cx="110" 
                            cy="110" 
                            r="80" 
                            fill="none" 
                            stroke="#F59E0B" 
                            strokeWidth="30" 
                            strokeDasharray="502" 
                            strokeDashoffset="427"
                            transform="rotate(198 110 110)" 
                          />
                          
                          {/* KYC/AML - 5% */}
                          <circle 
                            cx="110" 
                            cy="110" 
                            r="80" 
                            fill="none" 
                            stroke="#EC4899" 
                            strokeWidth="30" 
                            strokeDasharray="502" 
                            strokeDashoffset="476"
                            transform="rotate(252 110 110)" 
                          />
                        </svg>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#0EA5E9] rounded-full"></div>
                          <span className="text-xs">Regulatory (35%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                          <span className="text-xs">Legal (25%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#A855F7] rounded-full"></div>
                          <span className="text-xs">Privacy (20%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#F59E0B] rounded-full"></div>
                          <span className="text-xs">Ethical (15%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#EC4899] rounded-full"></div>
                          <span className="text-xs">KYC/AML (5%)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-3">Compliance Violation Trends</h4>
                      <div className="h-[220px]">
                        <svg width="100%" height="100%" viewBox="0 0 400 220">
                          {/* Background grid */}
                          <line x1="0" y1="200" x2="400" y2="200" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="0" y1="150" x2="400" y2="150" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="0" y1="100" x2="400" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="0" y1="50" x2="400" y2="50" stroke="#e2e8f0" strokeWidth="1" />
                          
                          {/* X-axis labels */}
                          <text x="25" y="215" textAnchor="middle" fontSize="10">Jan</text>
                          <text x="75" y="215" textAnchor="middle" fontSize="10">Feb</text>
                          <text x="125" y="215" textAnchor="middle" fontSize="10">Mar</text>
                          <text x="175" y="215" textAnchor="middle" fontSize="10">Apr</text>
                          <text x="225" y="215" textAnchor="middle" fontSize="10">May</text>
                          <text x="275" y="215" textAnchor="middle" fontSize="10">Jun</text>
                          <text x="325" y="215" textAnchor="middle" fontSize="10">Jul</text>
                          <text x="375" y="215" textAnchor="middle" fontSize="10">Aug</text>
                          
                          {/* Regulatory line */}
                          <polyline 
                            points="25,130 75,120 125,140 175,90 225,70 275,80 325,60 375,50" 
                            fill="none" 
                            stroke="#0EA5E9" 
                            strokeWidth="2" 
                          />
                          
                          {/* Legal line */}
                          <polyline 
                            points="25,150 75,140 125,150 175,120 225,130 275,120 325,110 375,100" 
                            fill="none" 
                            stroke="#14B8A6" 
                            strokeWidth="2" 
                          />
                          
                          {/* Privacy line */}
                          <polyline 
                            points="25,160 75,150 125,140 175,145 225,130 275,125 325,120 375,110" 
                            fill="none" 
                            stroke="#A855F7" 
                            strokeWidth="2" 
                          />
                          
                          {/* Ethical line */}
                          <polyline 
                            points="25,170 75,165 125,160 175,155 225,160 275,150 325,145 375,140" 
                            fill="none" 
                            stroke="#F59E0B" 
                            strokeWidth="2" 
                          />
                          
                          {/* KYC/AML line */}
                          <polyline 
                            points="25,180 75,175 125,170 175,172 225,168 275,165 325,160 375,155" 
                            fill="none" 
                            stroke="#EC4899" 
                            strokeWidth="2" 
                          />
                        </svg>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-1 bg-[#0EA5E9]"></div>
                          <span className="text-xs">Regulatory</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-1 bg-[#14B8A6]"></div>
                          <span className="text-xs">Legal</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-1 bg-[#A855F7]"></div>
                          <span className="text-xs">Privacy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-1 bg-[#F59E0B]"></div>
                          <span className="text-xs">Ethical</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-1 bg-[#EC4899]"></div>
                          <span className="text-xs">KYC/AML</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Compliance Reporting</CardTitle>
                  <CardDescription>
                    Generate compliance reports for internal auditing and regulatory requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Report Type</Label>
                        <Select defaultValue="monthly">
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily Compliance Summary</SelectItem>
                            <SelectItem value="weekly">Weekly Compliance Report</SelectItem>
                            <SelectItem value="monthly">Monthly Compliance Analysis</SelectItem>
                            <SelectItem value="quarterly">Quarterly Regulatory Report</SelectItem>
                            <SelectItem value="custom">Custom Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Time Period</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">From</Label>
                            <Input type="date" defaultValue="2025-02-01" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">To</Label>
                            <Input type="date" defaultValue="2025-02-28" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Include Categories</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="cat-regulatory" defaultChecked />
                            <label htmlFor="cat-regulatory" className="text-sm">Regulatory Compliance</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="cat-legal" defaultChecked />
                            <label htmlFor="cat-legal" className="text-sm">Legal Requirements</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="cat-privacy" defaultChecked />
                            <label htmlFor="cat-privacy" className="text-sm">Privacy Standards</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="cat-kyc" defaultChecked />
                            <label htmlFor="cat-kyc" className="text-sm">KYC/AML Standards</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="cat-ethical" defaultChecked />
                            <label htmlFor="cat-ethical" className="text-sm">Ethical Guidelines</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Report Format</Label>
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroup defaultValue="pdf">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pdf" id="format-pdf" />
                                <Label htmlFor="format-pdf" className="text-sm">PDF</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="csv" id="format-csv" />
                                <Label htmlFor="format-csv" className="text-sm">CSV</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="json" id="format-json" />
                                <Label htmlFor="format-json" className="text-sm">JSON</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Additional Options</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="include-trend" defaultChecked />
                            <label htmlFor="include-trend" className="text-sm">Include Trend Analysis</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="include-violations" defaultChecked />
                            <label htmlFor="include-violations" className="text-sm">Include Individual Violations</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="include-actions" defaultChecked />
                            <label htmlFor="include-actions" className="text-sm">Include Moderation Actions</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="include-recommendations" />
                            <label htmlFor="include-recommendations" className="text-sm">Include Recommendations</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Schedule Report</Label>
                        <div className="flex items-center space-x-2">
                          <Switch id="schedule-report" />
                          <Label htmlFor="schedule-report">Automatically generate this report</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">Setting this will create a recurring report based on your selected frequency</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between w-full">
                    <Button variant="outline">
                      <Save className="mr-2 h-4 w-4" />
                      Save Template
                    </Button>
                    <Button>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {classificationHistory.length > 0 ? (
              <div className="space-y-2">
                {classificationHistory.map((item, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getContentTypeIcon(item.contentType)}
                          <span className="font-medium capitalize">{item.contentType} Content</span>
                        </div>
                        <Badge className="capitalize">{item.complianceCategory.toLowerCase()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm">Compliance Score: {item.complianceScore}/100</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </p>
                          <Badge
                            variant="outline"
                            style={{ borderColor: getComplianceScoreLevel(item.complianceScore).color }}
                          >
                            {getComplianceScoreLevel(item.complianceScore).level}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-muted-foreground">Entities: {item.detectedEntities.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sensitive Data: {item.sensitiveDataTypes.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Flags: {item.regulatoryFlags.length}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="py-2 bg-muted/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        onClick={() => {
                          setContent("");
                          setClassification(item);
                          setActiveTab("results");
                        }}
                      >
                        View Results
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveTab("classifier");
                          // Here you'd typically set the content that generated this classification
                          // but we don't store that in our history for this demo
                        }}
                      >
                        Reclassify
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No classification history. Classify content to see history here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setContent("");
          setClassification(null);
        }}>
          Clear
        </Button>
        
        <div className="flex gap-2">
          {classification && (
            <Button variant="outline" className="flex items-center gap-1" disabled={isLoading}>
              <Save className="h-4 w-4" />
              Save Classification
            </Button>
          )}
          <Button disabled={!classification || isLoading} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Reclassify
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
