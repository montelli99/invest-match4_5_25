import React from "react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mode, Mode } from "app";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
}

/**
 * AdminLayout - Provides the main layout structure for the admin dashboard
 * 
 * This component includes the sidebar, header, and content area with proper styling
 */
export function AdminLayout({
  children,
  currentSection,
  onSectionChange,
  userName = "Admin User",
  userAvatar = "",
  userRole = "admin"
}: AdminLayoutProps) {
  // Development mode flag
  const isDev = mode === Mode.DEV;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar 
        currentSection={currentSection}
        onSectionChange={onSectionChange}
        userName={userName}
        userAvatar={userAvatar}
        userRole={userRole}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader 
          userName={userName}
          userAvatar={userAvatar}
          userRole={userRole}
        />
        
        {/* Preview Mode Banner */}
        {isDev && (
          <Alert className="m-4 bg-blue-100 mb-0">
            <AlertDescription>
              <span className="font-semibold">Preview Mode:</span> You're viewing the Admin Dashboard in preview mode. Authentication is bypassed.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
