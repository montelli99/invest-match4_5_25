import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { Upload, History } from "lucide-react";
import React, { useState, useEffect } from "react";
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
import { DocumentList } from "./DocumentList";
import { ShareDocumentDialog } from "./ShareDocumentDialog";
import { PermissionsDialog } from "./PermissionsDialog";

interface Props {
  userId: string;
}

export function DocumentManager({ userId }: Props) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [documentVersions, setDocumentVersions] = useState<DocumentMetadata[]>([]);
  const { toast } = useToast();

  const loadDocuments = async () => {
    try {
      const response = await brain.list_documents({ user_id: userId });
      const docs = await response.json();
      setDocuments(docs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [userId]);

  const handlePermissionInheritance = async (documentId: string, inherit: boolean) => {
    try {
      await brain.update_document_inheritance({
        document_id: documentId,
        user_id: userId,
        inherit_permissions: inherit,
      });

      toast({
        title: "Success",
        description: "Permission inheritance updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permission inheritance",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await brain.upload_document({
        file,
        user_id: userId,
        tags: [],
      });

      const newDoc = await response.json();
      setDocuments((prev) => [...prev, newDoc]);

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  const handleShare = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setShareDialogOpen(true);
  };

  const handleManagePermissions = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setPermissionsDialogOpen(true);
  };

  const handleViewVersions = async (documentId: string) => {
    try {
      const response = await brain.get_document_versions({
        document_id: documentId,
        user_id: userId,
      });
      const versions = await response.json();
      setDocumentVersions(versions);
      setSelectedDocumentId(documentId);
      setVersionHistoryOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load document versions",
        variant: "destructive",
      });
    }
  };

  const handleRestoreVersion = async (version: number) => {
    try {
      await brain.restore_document_version({
        document_id: selectedDocumentId,
        version,
        user_id: userId,
      });

      toast({
        title: "Success",
        description: "Document version restored successfully",
      });

      // Refresh document list
      await loadDocuments();
      setVersionHistoryOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore document version",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedDocumentId) return;

    try {
      await brain.delete_document({
        document_id: selectedDocumentId,
        user_id: userId,
      });

      setDocuments((prev) =>
        prev.filter((doc) => doc.document_id !== selectedDocumentId),
      );

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDocumentId("");
    }
  };

  const confirmDelete = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documents</h2>
        <Button asChild>
          <label className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
            />
          </label>
        </Button>
      </div>

      <DocumentList
        documents={documents}
        onShare={handleShare}
        onDelete={confirmDelete}
        onManagePermissions={handleManagePermissions}
        userId={userId}
      />

      <ShareDocumentDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        documentId={selectedDocumentId}
        userId={userId}
      />

      <PermissionsDialog
        isOpen={permissionsDialogOpen}
        onClose={() => setPermissionsDialogOpen(false)}
        documentId={selectedDocumentId}
        userId={userId}
      />

      <AlertDialog open={versionHistoryOpen} onOpenChange={setVersionHistoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Version History</AlertDialogTitle>
            <AlertDialogDescription>
              View and restore previous versions of this document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {documentVersions.map((version) => (
              <div
                key={version.version}
                className="flex items-center justify-between p-4 border rounded-lg mb-2"
              >
                <div>
                  <p className="font-medium">Version {version.version}</p>
                  <p className="text-sm text-muted-foreground">
                    Modified: {new Date(version.last_modified).toLocaleString()}
                  </p>
                </div>
                {version.version !== Math.max(...documentVersions.map(v => v.version)) && (
                  <Button
                    variant="outline"
                    onClick={() => handleRestoreVersion(version.version)}
                  >
                    Restore
                  </Button>
                )}
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
