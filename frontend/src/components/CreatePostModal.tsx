import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Link, Image, Video, Globe } from "lucide-react";

interface Post {
  type: string;
  title: string;
  content: string;
  tags?: string[];
  link?: string;
  mediaUrl?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostSubmit: (post: Post) => void;
}

export function CreatePostModal({ open, onOpenChange, onPostSubmit }: Props) {
  const [activeTab, setActiveTab] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [link, setLink] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags("");
    setLink("");
    setMediaUrl("");
    setActiveTab("text");
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    // Convert comma-separated tags into array
    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Determine post type based on active tab
    let postType = "";
    switch (activeTab) {
      case "text":
        postType = "market_update";
        break;
      case "opportunity":
        postType = "investment_opportunity";
        break;
      case "image":
      case "video":
        postType = "fund_launch";
        break;
      case "link":
        postType = "connection";
        break;
      default:
        postType = "market_update";
    }

    // Create post object
    const post: Post = {
      type: postType,
      title,
      content,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    };

    // Add media URL if available
    if (activeTab === "image" || activeTab === "video") {
      post.mediaUrl = mediaUrl;
    }

    // Add link if available
    if (activeTab === "link") {
      post.link = link;
    }

    onPostSubmit(post);
    handleClose();
  };

  // Simulate file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        // In a real implementation, this would be the URL returned from the server
        setMediaUrl(`https://example.com/media/${file.name}`);
      }
    }, 300);
  };

  const isSubmitDisabled = () => {
    if (!title || !content) return true;
    if (activeTab === "link" && !link) return true;
    if ((activeTab === "image" || activeTab === "video") && !mediaUrl && !isUploading) return true;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Update</span>
            </TabsTrigger>
            <TabsTrigger value="opportunity" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Opportunity</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span>Image</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span>Link</span>
            </TabsTrigger>
          </TabsList>

          {/* Common fields for all post types */}
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter post title"
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Share your thoughts..."
                rows={4}
              />
            </div>

            {/* Type-specific fields */}
            <TabsContent value="image" className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Upload Image</Label>
                <Input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading || !!mediaUrl}
                />
                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Uploading: {uploadProgress}%</p>
                  </div>
                )}
                {mediaUrl && <p className="text-xs text-green-600 mt-1">Image uploaded successfully!</p>}
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-4">
              <div>
                <Label htmlFor="link">Link URL</Label>
                <Input 
                  id="link" 
                  value={link} 
                  onChange={(e) => setLink(e.target.value)} 
                  placeholder="https://example.com/article"
                />
              </div>
            </TabsContent>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input 
                id="tags" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)} 
                placeholder="Private Equity, Tech, Venture Capital"
              />
            </div>
          </div>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled()}>Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
