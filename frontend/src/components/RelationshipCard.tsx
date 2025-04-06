import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

import { RelationshipMetrics } from "./RelationshipMetrics";
import { RelationshipTimeline } from "./RelationshipTimeline";

interface Props {
  onUpdateStatus?: (relationshipId: string, newStatus: string) => void;
  onRecordInteraction?: (relationshipId: string, type: string) => void;
  relationship: {
    history?: Array<{
      timestamp: string;
      note?: string;
      status?: string;
    }>;
    relationship_id: string;
    user1_id: string;
    user2_id: string;
    type: string;
    status: string;
    metrics: {
      successful_introductions: number;
      total_introductions: number;
      avg_response_time: number | null;
      quality_score: number;
      interaction_frequency: number;
    };
    last_interaction: string | null;
  };
  otherUserProfile: {
    name: string;
    company: string;
    role: string;
    user_id: string;
  };
}

export function RelationshipCard({ relationship, otherUserProfile, onUpdateStatus, onRecordInteraction }: Props) {
  const navigate = useNavigate();
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "inactive":
        return "bg-gray-500";
      case "blocked":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "mentor":
        return "bg-purple-500";
      case "peer":
        return "bg-blue-500";
      case "business":
        return "bg-indigo-500";
      case "investment":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const calculateStrengthColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const calculateStrengthLabel = (score: number) => {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "New";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };



  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{otherUserProfile.name}</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge 
                      variant="secondary" 
                      className={`${calculateStrengthColor(relationship.metrics.quality_score)}`}
                    >
                      {calculateStrengthLabel(relationship.metrics.quality_score)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Relationship strength based on quality score and interactions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription>{otherUserProfile.company}</CardDescription>
          </div>
          <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRecordInteraction?.(relationship.relationship_id, "document_share")}
          >
            <FileIcon className="mr-2 h-4 w-4" />
            Share Document
          </Button>
            <Badge
              variant="secondary"
              className={getStatusColor(relationship.status)}
            >
              {relationship.status}
            </Badge>
            <Badge
              variant="secondary"
              className={getTypeColor(relationship.type)}
            >
              {relationship.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <RelationshipMetrics metrics={relationship.metrics} />
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Last interaction: {formatDate(relationship.last_interaction)}
          </div>
          
          <RelationshipTimeline history={relationship.history} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Update Status
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Relationship Status</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => onUpdateStatus?.(relationship.relationship_id, "active")}
              >
                Active
              </Button>
              <Button
                variant="outline"
                onClick={() => onUpdateStatus?.(relationship.relationship_id, "inactive")}
              >
                Inactive
              </Button>
              <Button
                variant="outline"
                onClick={() => onUpdateStatus?.(relationship.relationship_id, "pending")}
              >
                Pending
              </Button>
              <Button
                variant="destructive"
                onClick={() => onUpdateStatus?.(relationship.relationship_id, "blocked")}
              >
                Block
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRecordInteraction?.(relationship.relationship_id, "message")}
          >
            Message
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRecordInteraction?.(relationship.relationship_id, "meeting")}
          >
            Schedule Meeting
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/Profile/${otherUserProfile.user_id}`)}
          >
            View Profile
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
