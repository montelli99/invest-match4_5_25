import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { DocumentMetadata } from "types";

interface Props {
  documentId: string;
  onVersionRestored: () => void;
}

export function VersionHistory({ documentId, onVersionRestored }: Props) {
  const [versions, setVersions] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const { toast } = useToast();

  // Fetch version history when component mounts
  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await brain.get_document_versions({ documentId });
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error("Error fetching versions:", error);
      toast({
        title: "Error",
        description: "Failed to load version history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Restore a specific version
  const handleRestore = async (version: number) => {
    try {
      setRestoring(true);
      await brain.restore_document_version({ documentId, version });
      toast({
        title: "Success",
        description: "Document version restored successfully",
      });
      onVersionRestored(); // Trigger refresh of document list
      await fetchVersions(); // Refresh version history
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Error",
        description: "Failed to restore version",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  // View a specific version
  const handleView = async (version: number) => {
    try {
      const response = await brain.get_document_version({
        documentId,
        version,
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error viewing version:", error);
      toast({
        title: "Error",
        description: "Failed to view version",
        variant: "destructive",
      });
    }
  };

  // Load versions when component mounts
  useEffect(() => {
    if (!documentId) return;

    fetchVersions();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((version, index) => (
            <TableRow key={version.version}>
              <TableCell>{version.version}</TableCell>
              <TableCell>
                {format(new Date(version.last_modified), "PPp")}
              </TableCell>
              <TableCell>{Math.round(version.size_bytes / 1024)} KB</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(version.version || 0)}
                  >
                    View
                  </Button>
                  {index > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(version.version || 0)}
                      disabled={restoring}
                    >
                      {restoring ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Restore"
                      )}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
