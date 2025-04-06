import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { formatDistanceToNow } from "date-fns";
import { Download, FileText, Share2, Trash2, Shield, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React from "react";
interface DocumentMetadata {
  document_id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  uploaded_by: string;
  upload_date: string;
  last_modified: string;
  is_encrypted: boolean;
  shared_with: string[];
  version: number;
  tags: string[];
}

interface Props {
  documents: DocumentMetadata[];
  onShare: (documentId: string) => void;
  onDelete: (documentId: string) => void;
  onManagePermissions: (documentId: string) => void;
  onViewVersions: (documentId: string) => void;
  userId: string;
}

export function DocumentList({ documents, onShare, onDelete, onManagePermissions, onViewVersions, userId }: Props) {
  const { toast } = useToast();

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      const response = await brain.get_document({
        document_id: documentId,
        user_id: userId,
      });
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <Card
          key={doc.document_id}
          className="hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-medium truncate" title={doc.filename}>
                    {doc.filename}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.upload_date), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {(doc.size_bytes / 1024).toFixed(1)} KB
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc.document_id, doc.filename)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {doc.uploaded_by === userId && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onShare(doc.document_id)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(doc.document_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {doc.shared_with.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Shared with {doc.shared_with.length} user
                    {doc.shared_with.length !== 1 ? "s" : ""}
                  </Badge>
                )}
                {doc.is_encrypted && (
                  <Badge variant="outline" className="text-xs">
                    Encrypted
                  </Badge>
                )}
              </div>
              {doc.uploaded_by === userId && doc.shared_with.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManagePermissions(doc.document_id)}
                >
                  <Shield className="h-4 w-4" />
                </Button>
              )}
              {doc.uploaded_by === userId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewVersions(doc.document_id)}
                >
                  <History className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
