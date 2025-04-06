import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authedBrain } from "@/components/AuthWrapper";
import { AuthWrapper } from "@/components/AuthWrapper";
import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SuggestedArticles } from "@/components/SuggestedArticles";
import { useNavigate } from "react-router-dom";

import { TicketPriority } from "types";

interface Category {
  id: string;
  name: string;
  description?: string;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export default function CreateTicket() {
  return (
    <AuthWrapper>
      <CreateTicketContent />
    </AuthWrapper>
  );
}

function CreateTicketContent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium" as TicketPriority);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    { id: "general", name: "General" },
    { id: "technical", name: "Technical Issue" },
    { id: "billing", name: "Billing" },
    { id: "feature", name: "Feature Request" },
    { id: "other", name: "Other" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const handleArticleClick = useCallback((article: any) => {
    setSelectedArticle(article);
    setShowArticleDialog(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload attachment if present
      let attachmentId = null;
      if (file) {
        // Convert File to base64 string
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64.split(",")[1]); // Remove data:image/jpeg;base64, prefix
          };
        });
        reader.readAsDataURL(file);
        const base64String = await base64Promise;

        const uploadResponse = await authedBrain.add_attachment(
          { ticketId: "temp", file: base64String },
          {}
        );
        const uploadData = await uploadResponse.json();
        attachmentId = uploadData.id;
      }

      // Create ticket
      const response = await authedBrain.create_ticket({
        request: {
          title,
          description,
          priority,
          category_id: selectedCategory,
          attachments: attachmentId ? [attachmentId] : undefined,
        },
        token: {}
      });

      const data = await response.json();
      navigate(`/ViewTicket?id=${data.id}`);
    } catch (err) {
      console.error("Error creating ticket:", err);
      setError("Failed to create ticket. Please try again.");
    } finally {
      setLoading(false);
    }

  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        e.target.value = ''; // Reset input
        setFile(null);
        setImagePreview(null);
        return;
      }

      setError(null);
      setFile(selectedFile);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleBack = () => {
    navigate("/TicketManagement");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={handleBack} className="mr-4">
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Create New Ticket</h1>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Create Support Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <SuggestedArticles
                searchText={`${title} ${description}`}
                onArticleClick={handleArticleClick}
              />
            </div>
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger id="category" className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="title">Title</Label>
                <span className="text-sm text-gray-500">
                  {title.length}/{MAX_TITLE_LENGTH}
                </span>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_TITLE_LENGTH) {
                    setTitle(e.target.value);
                  }
                }}
                placeholder="Enter ticket title"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="description">Description</Label>
                <span className="text-sm text-gray-500">
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                    setDescription(e.target.value);
                  }
                }}
                placeholder="Describe your issue. You can use markdown for formatting."
                className="min-h-[150px] font-mono"
                required
              />
              <p className="text-sm text-gray-500">
                Supports markdown: **bold**, *italic*, `code`, # headers, - lists
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TicketPriority)}
              >
                <SelectTrigger id="priority" className="w-[180px]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Attachment (optional)</Label>
              <Input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <p className="text-sm text-gray-500">
                Maximum file size: 5MB. Supported formats: Images, PDF, DOC, DOCX, TXT
              </p>
              {file && (
                <div className="space-y-2">
                  {imagePreview ? (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs rounded-md shadow-sm"
                      />
                    </div>
                  ) : (
                <p className="text-sm text-gray-500">
                  Selected file: {file.name} ({Math.round(file.size / 1024)}KB)
                </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </div>
          </form>

          <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedArticle?.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className="prose max-w-none">
                  {selectedArticle?.content}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
