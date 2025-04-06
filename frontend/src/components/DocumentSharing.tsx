import { useState } from "react";
import { authedBrain as brain } from "@/components/AuthWrapper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileUp, 
  Paperclip, 
  Clock, 
  Loader2, 
  XCircle,
  CheckCircle2,
  Eye,
  Download,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

interface Document {
  id: string;
  filename: string;
  size: number;
  upload_date: string;
  type: string;
  url: string;
}

interface User {
  uid: string;
  display_name: string;
  company_name?: string;
}

interface DocumentSharingProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User;
}

export function DocumentSharing({ isOpen, onClose, recipient }: DocumentSharingProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [message, setMessage] = useState("");
  const [expiry, setExpiry] = useState("7days");
  const [loading, setLoading] = useState(false);
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([
    {
      id: "doc-1",
      filename: "Pitch Deck - Q1 2025.pdf",
      size: 2400000,
      upload_date: new Date().toISOString(),
      type: "pdf",
      url: "#"
    },
    {
      id: "doc-2",
      filename: "Investment Opportunity.docx",
      size: 1500000,
      upload_date: new Date().toISOString(),
      type: "docx",
      url: "#"
    },
    {
      id: "doc-3",
      filename: "Financial Projections.xlsx",
      size: 3200000,
      upload_date: new Date().toISOString(),
      type: "xlsx",
      url: "#"
    }
  ]);
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const toggleDocumentSelection = (doc: Document) => {
    if (selectedDocuments.some(d => d.id === doc.id)) {
      setSelectedDocuments(selectedDocuments.filter(d => d.id !== doc.id));
    } else {
      setSelectedDocuments([...selectedDocuments, doc]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This would be replaced with actual file upload logic
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Mock document creation
    const newDocs = Array.from(files).map((file, index) => ({
      id: `new-doc-${Date.now()}-${index}`,
      filename: file.name,
      size: file.size,
      upload_date: new Date().toISOString(),
      type: file.name.split('.').pop() || '',
      url: "#"
    }));

    setSelectedDocuments([...selectedDocuments, ...newDocs]);
    // Reset the input
    e.target.value = '';
  };

  const handleShareDocuments = async () => {
    if (selectedDocuments.length === 0) {
      toast.error("Please select at least one document to share");
      return;
    }

    try {
      setLoading(true);
      
      // Share documents logic would go here
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Documents shared with ${recipient.display_name}`);
      onClose();
    } catch (error) {
      console.error("Error sharing documents:", error);
      toast.error("Failed to share documents");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Share Documents</DialogTitle>
          <DialogDescription>
            Share documents with {recipient.display_name}
            {recipient.company_name && ` from ${recipient.company_name}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Upload new document */}
          <Card className="p-3 border-dashed border-2 cursor-pointer hover:bg-accent/50 transition-colors">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Upload Documents</p>
              <p className="text-xs text-muted-foreground">Drag files here or click to browse</p>
              <Input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                multiple 
              />
            </label>
          </Card>
          
          {/* Selected documents */}
          {selectedDocuments.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Documents ({selectedDocuments.length})</Label>
              <div className="max-h-[150px] overflow-y-auto space-y-2">
                {selectedDocuments.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-2 rounded-md bg-accent/30"
                  >
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[250px]">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleDocumentSelection(doc)}
                    >
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recent documents */}
          <div className="space-y-2">
            <Label>Recent Documents</Label>
            <div className="max-h-[150px] overflow-y-auto space-y-2">
              {recentDocuments.map((doc) => (
                <div 
                  key={doc.id} 
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedDocuments.some(d => d.id === doc.id) ? 'bg-primary/10' : 'hover:bg-accent/50'}`}
                  onClick={() => toggleDocumentSelection(doc)}
                >
                  <div className="flex items-center">
                    <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[250px]">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  {selectedDocuments.some(d => d.id === doc.id) ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note about these documents..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Access Expiry</Label>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24hours">24 Hours</SelectItem>
                  <SelectItem value="3days">3 Days</SelectItem>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="never">Never Expires</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">Enable Analytics</Label>
                <Switch
                  id="analytics"
                  checked={enableAnalytics}
                  onCheckedChange={setEnableAnalytics}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {enableAnalytics ? (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>Track views, downloads and time spent</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    <span>Simple sharing without tracking</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <div className="flex items-center">
            {selectedDocuments.length > 0 ? (
              <Badge variant="secondary">
                {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
              </Badge>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleShareDocuments} disabled={loading || selectedDocuments.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                "Share Documents"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
