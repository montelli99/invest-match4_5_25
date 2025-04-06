import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FileText, Upload, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import brain from "brain";

interface Props {
  userId: string;
  userRole?: string;
  onUpdate?: () => void;
}

interface VerificationDocument {
  status: string;
  upload_date?: string;
  expiry_date?: string;
  review_notes?: string;
  is_optional?: boolean;
  message?: string;
}

interface VerificationStatus {
  user_id: string;
  role: string;
  documents: Record<string, VerificationDocument>;
  required_documents: string[];
  verification_complete: boolean;
}

interface DocumentTypeInfo {
  label: string;
  description: string;
}

const DocumentTypes: Record<string, DocumentTypeInfo> = {
  id_card: {
    label: "ID Card",
    description: "Government-issued identification card"
  },
  passport: {
    label: "Passport",
    description: "Valid passport document"
  },
  driving_license: {
    label: "Driving License",
    description: "Valid driving license"
  },
  business_license: {
    label: "Business License",
    description: "Business registration or license"
  },
  fund_credentials: {
    label: "Fund Credentials",
    description: "Fund management certification or credentials"
  },
  accreditation: {
    label: "Accreditation",
    description: "Accredited investor documentation"
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "approved":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    case "missing":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Required
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          {status}
        </Badge>
      );
  }
};

export function DocumentVerificationForm({ userId, userRole, onUpdate }: Props) {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchVerificationStatus();
    }
  }, [userId]);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await brain.get_verification_status({ user_id: userId });
      const data = await response.json();
      setVerificationStatus(data);
      
      // If we don't have a selected document type yet and there are required documents,
      // set the first missing required document as selected
      if (!selectedDocument && data.required_documents && data.required_documents.length > 0) {
        const missingDoc = data.required_documents.find(
          (docType: string) => data.documents[docType]?.status === "missing"
        );
        if (missingDoc) {
          setSelectedDocument(missingDoc);
        } else {
          setSelectedDocument(data.required_documents[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load verification status. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: `The file exceeds the maximum size of 10MB.`
        });
        return;
      }
      
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/tiff",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF, image, or document file."
        });
        return;
      }
      
      setDocumentFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedDocument || !documentFile) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a document type and upload a file."
      });
      return;
    }

    try {
      setUploadingDocument(selectedDocument);
      
      // Create a FormData object
      const formData = new FormData();
      formData.append("file", documentFile);
      formData.append("user_id", userId);
      formData.append("document_type", selectedDocument);
      formData.append("is_required", "true");
      
      if (expiryDate) {
        formData.append("expiry_date", expiryDate.toISOString());
      }

      // Use fetch directly since we need to post FormData
      const response = await fetch(`/api/upload-document`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload document");
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully. It will be reviewed shortly."
      });

      // Reset form
      setDocumentFile(null);
      setExpiryDate(undefined);
      
      // Refresh verification status
      await fetchVerificationStatus();
      
      // Call onUpdate if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload document. Please try again."
      });
    } finally {
      setUploadingDocument(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-3/4 bg-gray-200 rounded-md"></div>
          <div className="h-32 w-full bg-gray-200 rounded-md"></div>
          <div className="h-12 w-1/3 bg-gray-200 rounded-md"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Document Verification</h2>
        <p className="text-gray-500">
          Please upload the required documents to verify your account.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Required Documents</h3>
        
        {verificationStatus?.verification_complete ? (
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700 font-medium">Verification Complete</span>
            </div>
            <p className="text-green-600 mt-1 text-sm">
              All your required documents have been verified successfully.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {verificationStatus?.required_documents.map((docType) => {
              const doc = verificationStatus.documents[docType];
              return (
                <div key={docType} className="flex justify-between items-center p-4 rounded-lg border">
                  <div className="space-y-1">
                    <div className="font-medium">{DocumentTypes[docType]?.label || docType}</div>
                    <div className="text-sm text-gray-500">{DocumentTypes[docType]?.description}</div>
                    {doc?.upload_date && (
                      <div className="text-xs text-gray-400">
                        Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                      </div>
                    )}
                    {doc?.review_notes && (
                      <div className="text-xs text-red-500 mt-1">
                        Note: {doc.review_notes}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={doc?.status || "missing"} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!verificationStatus?.verification_complete && (
        <>
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Upload Document</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select 
                  value={selectedDocument} 
                  onValueChange={setSelectedDocument}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {verificationStatus?.required_documents.map((docType) => (
                      <SelectItem key={docType} value={docType}>
                        {DocumentTypes[docType]?.label || docType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiry-date">Expiry Date (if applicable)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : "Select expiry date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="document-file">Upload File</Label>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    asChild
                  >
                    <label className="cursor-pointer flex gap-2 items-center justify-center">
                      <Upload className="h-4 w-4" />
                      {documentFile ? documentFile.name : "Choose file"}
                      <input
                        id="document-file"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff"
                        onChange={handleDocumentChange}
                      />
                    </label>
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, JPG, PNG, TIFF, DOC, DOCX (Max 10MB)
                </p>
              </div>
              
              <Button 
                onClick={handleUpload} 
                disabled={!selectedDocument || !documentFile || !!uploadingDocument}
                className="w-full"
              >
                {uploadingDocument ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
