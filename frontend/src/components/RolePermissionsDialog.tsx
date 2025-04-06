import { useAuth } from "@/components/AuthWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import brain from "brain";
import { UserRole } from "types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionsUpdate?: () => void;
}

interface RolePermissions {
  [key: string]: string[];
}

const ROLE_HIERARCHY = {
  [UserRole.SuperAdmin]: [
    "manage_admins",
    "manage_roles",
    "manage_permissions",
    "view_audit_logs",
    "manage_users",
    "moderate_content",
    "view_reports",
    "manage_settings",
  ],
  [UserRole.Admin]: [
    "manage_users",
    "moderate_content",
    "view_reports",
    "manage_settings",
  ],
  [UserRole.Moderator]: ["moderate_content", "view_reports"],
};

export const RolePermissionsDialog = ({
  open,
  onOpenChange,
  onPermissionsUpdate,
}: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<RolePermissions>(ROLE_HIERARCHY);
  const [initialPermissions, setInitialPermissions] = useState<RolePermissions>(ROLE_HIERARCHY);
  const [loading, setLoading] = useState(false);

  const handlePermissionToggle = (role: UserRole, permission: string) => {
    setPermissions((prev) => {
      const rolePermissions = [...prev[role]];
      if (rolePermissions.includes(permission)) {
        return {
          ...prev,
          [role]: rolePermissions.filter((p) => p !== permission),
        };
      } else {
        return {
          ...prev,
          [role]: [...rolePermissions, permission],
        };
      }
    });
  };

  const loadPermissions = async () => {
    try {
      const response = await brain.get_permissions({
        token: {
          idToken: await user?.getIdToken(),
        },
      });
      const data = await response.json();
      if (data.permissions) {
        setPermissions(data.permissions);
        setInitialPermissions(data.permissions);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open && user) {
      loadPermissions();
    }
  }, [open, user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Only update roles that have changed
      for (const [role, rolePermissions] of Object.entries(permissions)) {
        if (JSON.stringify(rolePermissions) !== JSON.stringify(initialPermissions[role])) {
          await brain.update_role_permissions({
            role,
            permissions: rolePermissions,
            token: {
              idToken: await user?.getIdToken(),
            },
          });
        }
      }
      toast({
        title: "Success",
        description: "Role permissions updated successfully",
      });
      onPermissionsUpdate?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const allPermissions = Array.from(
    new Set(Object.values(ROLE_HIERARCHY).flat()),
  ).sort();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Role Permissions Management</DialogTitle>
          <DialogDescription>
            Configure permissions for each role in the system. Higher roles
            inherit permissions from lower roles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto py-4">
          {Object.entries(permissions).map(([role, rolePermissions]) => (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {role
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                  <Badge
                    variant={
                      role === UserRole.SuperAdmin
                        ? "destructive"
                        : role === UserRole.Admin
                          ? "default"
                          : "secondary"
                    }
                  >
                    {rolePermissions.length} Permissions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {allPermissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${role}-${permission}`}
                        checked={rolePermissions.includes(permission)}
                        onCheckedChange={() =>
                          handlePermissionToggle(role as UserRole, permission)
                        }
                        disabled={role === UserRole.SuperAdmin} // Super admin permissions cannot be modified
                      />
                      <label
                        htmlFor={`${role}-${permission}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
