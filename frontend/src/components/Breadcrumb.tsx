import { 
  ChevronRight, 
  Home,
  LayoutDashboard,
  Search,
  UserCircle,
  Settings,
  MessageCircle,
  Inbox,
  MessagesSquare,
  Users,
  UserPlus,
  Handshake,
  BarChart,
  FileText,
  Download,
  User,
  CreditCard,
  Receipt,
  HelpCircle,
  LifeBuoy,
  HelpingHand,
  type LucideIcon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PathInfo {
  label: string;
  Icon: LucideIcon;
  category?: string;
  description?: string;
}

const pathInfo: Record<string, PathInfo> = {
  dashboard: { label: "Dashboard", Icon: LayoutDashboard, category: "main", description: "Overview of your account and activities" },
  search: { label: "Search", Icon: Search, category: "main", description: "Find and connect with other users" },
  createprofile: { label: "Create Profile", Icon: UserPlus, category: "profile", description: "Set up your investment profile" },
  editprofile: { label: "Edit Profile", Icon: UserCircle, category: "profile", description: "Update your profile" },
  profile: { label: "Profile", Icon: User, category: "profile", description: "View your profile" },
  settings: { label: "Settings", Icon: Settings, category: "settings", description: "Manage your account settings" },
  messages: { label: "Messages", Icon: MessageCircle, category: "communication", description: "View your messages" },
  inbox: { label: "Inbox", Icon: Inbox, category: "communication", description: "Check your inbox" },
  chat: { label: "Chat", Icon: MessagesSquare, category: "communication", description: "Chat with other users" },
  contacts: { label: "Contacts", Icon: Users, category: "network", description: "Manage your contacts" },
  importcontacts: { label: "Import Contacts", Icon: UserPlus, category: "network", description: "Import your contacts" },
  matches: { label: "Matches", Icon: Handshake, category: "network", description: "View your matches" },
  analytics: { label: "Analytics", Icon: BarChart, category: "data", description: "View your analytics" },
  reports: { label: "Reports", Icon: FileText, category: "data", description: "View your reports" },
  export: { label: "Export Data", Icon: Download, category: "data", description: "Export your data" },
  help: { label: "Help", Icon: HelpCircle, category: "support", description: "Get help" },
  support: { label: "Support", Icon: LifeBuoy, category: "support", description: "Contact support" },
  faq: { label: "FAQ", Icon: HelpingHand, category: "support", description: "View FAQs" }
};

function BreadcrumbItem({ segment, path, isLast }: { segment: string; path: string; isLast: boolean }) {
  const info = pathInfo[segment.toLowerCase()];
  const IconComponent = info?.Icon;

  const content = (
    <span className="flex items-center gap-1.5">
      {IconComponent && <IconComponent className="h-4 w-4" />}
      {info?.label || segment}
    </span>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {isLast ? (
            <span className="ml-1 font-medium text-foreground bg-primary/5 px-2 py-0.5 rounded-md">
              {content}
            </span>
          ) : (
            <Link
              to={path}
              className="ml-1 hover:text-foreground transition-all duration-200 hover:scale-105 hover:bg-muted/50 px-2 py-0.5 rounded-md"
            >
              {content}
            </Link>
          )}
        </TooltipTrigger>
        {info?.description && (
          <TooltipContent>
            <p>{info.description}</p>
            {info.category && (
              <Badge variant="outline" className="mt-1">
                {info.category}
              </Badge>
            )}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export function Breadcrumb() {
  const location = useLocation();

  if (location.pathname === "/") return null;

  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-1 text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg shadow-sm backdrop-blur-sm"
    >
      <Link
        to="/"
        className="flex items-center hover:text-foreground transition-all duration-200 hover:scale-105"
      >
        <Home className="h-4 w-4" />
      </Link>
      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const isLast = index === pathSegments.length - 1;

        return (
          <span key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <BreadcrumbItem
              segment={segment}
              path={path}
              isLast={isLast}
            />
          </span>
        );
      })}
    </nav>
  );
}


