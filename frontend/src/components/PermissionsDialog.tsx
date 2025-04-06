import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Shield, UserX, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useEffect, useState } from "react";

interface UserPermissions {
  email: string;
  permissions: {
    view: boolean;
    edit: boolean;
    download: boolean;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  userId: string;
}

export function PermissionsDialog({
  isOpen,
  onClose,
  documentId,
  userId,
}: Props) {
  const [users, setUsers] = useState<UserPermissions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen, documentId]);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await brain.get_document_permissions({
        document_id: documentId,
        user_id: userId,
      });
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePermission = async (
    email: string,
    permission: keyof UserPermissions["permissions"],
    value: boolean,
  ) => {
    try {
      await brain.update_document_permissions({
        document_id: documentId,
        user_id: userId,
        updates: [
          {
            email,
            permission,
            value,
          },
        ],
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.email === email
            ? {
                ...user,
                permissions: {
                  ...user.permissions,
                  [permission]: value,
                },
              }
            : user,
        ),
      );

      toast({
        title: "Success",
        description: "Permission updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    }
  };

  const revokeAccess = async (email: string) => {
    try {
      await brain.revoke_document_access({
        document_id: documentId,
        user_id: userId,
        email,
      });

      setUsers((prev) => prev.filter((user) => user.email !== email));

      toast({
        title: "Success",
        description: "Access revoked successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke access",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Manage Permissions
          </DialogTitle>
          <DialogDescription>
            Control who has access to this document and what they can do with
            it.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading permissions...
          </div>
        ) : (
          <div className="mt-4">
            {users.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                This document hasn't been shared with anyone yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-center">
                      View
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Users can view the document content</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-center">
                      Edit
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Users can make changes to the document</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-center">
                      Download
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Users can download and save the document</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={user.permissions.view}
                          onCheckedChange={(checked) =>
                            updatePermission(
                              user.email,
                              "view",
                              checked as boolean,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={user.permissions.edit}
                          onCheckedChange={(checked) =>
                            updatePermission(
                              user.email,
                              "edit",
                              checked as boolean,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={user.permissions.download}
                          onCheckedChange={(checked) =>
                            updatePermission(
                              user.email,
                              "download",
                              checked as boolean,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeAccess(user.email)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
