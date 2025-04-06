import { useAuth } from "@/components/AuthWrapper";
import { DocumentVerificationForm } from "@/components/DocumentVerificationForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FileCheck } from "lucide-react";
import { useEffect, useState } from "react";
import brain from "brain";

export default function DocumentVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchUserProfile();
    }
  }, [user?.uid]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await brain.get_profile({ userId: user?.uid || "" });
      const profile = await response.json();
      setUserProfile(profile);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Account", href: "/Profile" },
            { label: "Document Verification", href: "/DocumentVerification" },
          ]}
        />
        
        <div className="flex items-center space-x-2">
          <FileCheck className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-semibold">Document Verification</h1>
        </div>
        
        <p className="text-gray-500">
          To access all features of InvestMatch, please verify your identity and credentials by uploading the required documents.
          All documents are securely stored and reviewed by our compliance team.
        </p>

        <Tabs defaultValue="documents">
          <TabsList className="mb-4">
            <TabsTrigger value="documents">Required Documents</TabsTrigger>
            <TabsTrigger value="help">Help & Guidelines</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents">
            <DocumentVerificationForm 
              userId={user?.uid || ""}
              userRole={userProfile?.role}
              onUpdate={fetchUserProfile}
            />
          </TabsContent>
          
          <TabsContent value="help">
            <div className="prose max-w-none">
              <h2>Document Verification Guidelines</h2>
              
              <h3>Document Requirements</h3>
              <ul>
                <li><strong>Image Quality:</strong> Documents must be clearly visible and legible.</li>
                <li><strong>File Size:</strong> Maximum file size is 10MB per document.</li>
                <li><strong>Valid Documents:</strong> All documents must be current and not expired.</li>
                <li><strong>Complete Documents:</strong> All information must be visible including document number, issue date, expiry date, and personal information.</li>
              </ul>
              
              <h3>Required Documents by Role</h3>
              
              <h4>Fund Managers</h4>
              <ul>
                <li><strong>ID Card/Passport:</strong> Government-issued identification.</li>
                <li><strong>Fund Management Credentials:</strong> Documentation proving your fund management role.</li>
                <li><strong>Accreditation Status:</strong> Documentation of professional accreditation.</li>
              </ul>
              
              <h4>Limited Partners</h4>
              <ul>
                <li><strong>ID Card/Passport:</strong> Government-issued identification.</li>
                <li><strong>Accreditation Status:</strong> Documentation proving accredited investor status.</li>
              </ul>
              
              <h4>Capital Raisers</h4>
              <ul>
                <li><strong>ID Card/Passport:</strong> Government-issued identification.</li>
                <li><strong>Business License:</strong> Business registration or professional license.</li>
              </ul>
              
              <h3>Verification Process</h3>
              <ol>
                <li>Upload the required documents through this portal.</li>
                <li>Our compliance team will review your documents within 1-2 business days.</li>
                <li>You will receive a notification once your documents are approved or if additional information is needed.</li>
                <li>Once approved, you will have full access to all platform features.</li>
              </ol>
              
              <h3>Privacy & Security</h3>
              <p>
                All documents are encrypted and securely stored following industry best practices and regulatory requirements. 
                Your privacy is our priority, and we only use these documents for verification purposes. 
                For more information, please review our <a href="/Privacy">Privacy Policy</a>.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
