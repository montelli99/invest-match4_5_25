import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Briefcase,
  Globe,
  MessageCircle,
  Share2,
  ThumbsUp,
  TrendingUp,
  Users,
  Image as ImageIcon,
  Video,
  Link,
  PlusCircle,
} from "lucide-react";
import { CreatePostModal } from "./CreatePostModal";
import * as React from "react";

interface FeedItem {
  id: string;
  type:
    | "investment_opportunity"
    | "market_update"
    | "connection"
    | "fund_launch"
    | "event";
  title: string;
  content: string;
  author: {
    name: string;
    role: string;
    company: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  tags?: string[];
  mediaUrl?: string;
  link?: string;
}

interface NewsFeedProps {
  onMessageClick?: (userId: string) => void;
}

export function NewsFeed({ onMessageClick }: NewsFeedProps) {
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);
  const [feedItems, setFeedItems] = React.useState<FeedItem[]>([
    {
      id: "1",
      type: "investment_opportunity",
      title: "New Investment Opportunity in Tech Sector",
      content:
        "Seeking limited partners for a new $50M fund focused on early-stage SaaS companies. Strong track record with 3x returns on previous fund.",
      author: {
        name: "Sarah Chen",
        role: "Managing Partner",
        company: "Horizon Ventures",
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 24,
      comments: 8,
      tags: ["Tech", "SaaS", "Venture Capital"],
    },
    {
      id: "2",
      type: "market_update",
      title: "Market Analysis: Private Equity in 2024",
      content:
        "Latest trends show increasing focus on sustainable investments and digital transformation across PE portfolios. Key sectors include healthcare tech and renewable energy.",
      author: {
        name: "Michael Ross",
        role: "Market Analyst",
        company: "Global Insights",
      },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      likes: 45,
      comments: 12,
      tags: ["Market Analysis", "Private Equity", "Trends"],
    },
    {
      id: "3",
      type: "fund_launch",
      title: "New Sustainable Infrastructure Fund",
      content:
        "Launching $200M infrastructure fund focused on sustainable development projects across North America. Targeting 15% IRR with quarterly distributions.",
      author: {
        name: "David Kumar",
        role: "Fund Manager",
        company: "GreenPath Capital",
      },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      likes: 32,
      comments: 15,
      tags: ["Infrastructure", "ESG", "Sustainable Investing"],
    },
  ]);

  const getTypeIcon = (type: FeedItem["type"]) => {
    switch (type) {
      case "investment_opportunity":
        return <Briefcase className="h-5 w-5" />;
      case "market_update":
        return <TrendingUp className="h-5 w-5" />;
      case "connection":
        return <Users className="h-5 w-5" />;
      case "fund_launch":
        return <Globe className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(timestamp).getTime()) / 1000,
    );
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handlePostSubmit = (post: Omit<FeedItem, "id" | "author" | "timestamp" | "likes" | "comments">) => {
    // In a real implementation, this would be sent to an API
    // Here we're just adding it to the local state
    
    const newPost: FeedItem = {
      id: `temp-${Date.now()}`,
      ...post,
      author: {
        name: "Current User",
        role: "Fund Manager",
        company: "Your Company"
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
    
    setFeedItems([newPost, ...feedItems]);
  };

  return (
    <div className="space-y-6">
      {/* Create Post Modal */}
      <CreatePostModal 
        open={isPostModalOpen} 
        onOpenChange={setIsPostModalOpen} 
        onPostSubmit={handlePostSubmit} 
      />
      
      {/* Create Post Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setIsPostModalOpen(true)}
          >
            Share an investment opportunity or update...
          </Button>
        </div>
        <div className="flex mt-4 gap-2 justify-around">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setIsPostModalOpen(true)}
          >
            <Globe className="h-4 w-4" />
            <span>Update</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setIsPostModalOpen(true)}
          >
            <Briefcase className="h-4 w-4" />
            <span>Opportunity</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setIsPostModalOpen(true)}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Image</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setIsPostModalOpen(true)}
          >
            <Link className="h-4 w-4" />
            <span>Link</span>
          </Button>
        </div>
      </Card>

      {/* Feed Items */}
      {feedItems.map((item) => (
        <Card key={item.id} className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                {getTypeIcon(item.type)}
              </div>
              <div>
                <h4 className="font-semibold">{item.author.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.author.role} at {item.author.company}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(item.timestamp)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessageClick?.(item.id)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-muted-foreground">{item.content}</p>
            
            {/* Render media if available */}
            {item.mediaUrl && (
              <div className="mt-4 rounded-md overflow-hidden">
                {item.type === "fund_launch" ? (
                  <img 
                    src={item.mediaUrl} 
                    alt={item.title} 
                    className="w-full h-auto max-h-[300px] object-cover"
                  />
                ) : (
                  <video 
                    src={item.mediaUrl} 
                    controls 
                    className="w-full h-auto max-h-[300px]"
                  />
                )}
              </div>
            )}
            
            {/* Render link preview if available */}
            {item.link && (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 block p-3 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-primary" />
                  <span className="text-primary text-sm truncate">{item.link}</span>
                </div>
              </a>
            )}
            
            {item.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ThumbsUp className="h-4 w-4 mr-2" />
              {item.likes}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <MessageCircle className="h-4 w-4 mr-2" />
              {item.comments}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
