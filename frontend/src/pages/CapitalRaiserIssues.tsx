import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import brain from "brain";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function CapitalRaiserIssues() {
  const [isUploading, setIsUploading] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await brain.upload_capital_raiser_issues(formData);
      const result = await response.json();

      if (result.success) {
        toast.success(`Successfully uploaded ${result.total_issues} issues`);
        fetchIssues(); // Refresh the list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to upload file");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await brain.list_capital_raiser_issues();
      const data = await response.json();
      setIssues(data);
    } catch (error) {
      console.error("Failed to fetch issues:", error);
      toast.error("Failed to load issues");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Capital Raiser Issues</h1>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"}
                ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <input {...getInputProps()} disabled={isUploading} />
              {isUploading ? (
                <p>Uploading...</p>
              ) : isDragActive ? (
                <p>Drop the CSV file here</p>
              ) : (
                <div>
                  <p className="text-muted-foreground">
                    Drag and drop a CSV file here, or click to select
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    disabled={isUploading}
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No issues uploaded yet. Upload a CSV file to see issues here.
              </p>
            ) : (
              <div className="divide-y">
                {issues.map((issue, index) => (
                  <div key={index} className="py-4">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(issue, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
