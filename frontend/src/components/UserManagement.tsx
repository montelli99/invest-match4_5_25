import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useState, useEffect, useMemo } from "react";
import { AdminUser, UserRole, UserAction } from "types";
import { useAuth } from "@/components/AuthWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { UserActivityLogs } from "./UserActivityLogs";
import { UserProfileDialog } from "./UserProfileDialog";
import { RolePermissionsDialog } from "./RolePermissionsDialog";

export const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string>("");
  const [isRolePermissionsOpen, setIsRolePermissionsOpen] = useState(false);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await brain.list_admin_users({
        token: {
          idToken: await user?.getIdToken()
        }
      });
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (
    userId: string,
    role: UserRole,
    action: UserAction,
  ) => {
    try {
      await brain.update_user_role({
        token: {
          idToken: await user?.getIdToken()
        },
        user_id: userId,
        role,
        action,

      });
      toast({
        title: "Success",
        description: `User role ${action === "add" ? "added" : "removed"} successfully`,
      });
      loadUsers(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.uid));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkAction = async (role: UserRole | null, action: UserAction) => {
    if (!selectedUsers.length) return;

    try {
      if (role) {
        // Role update
        await Promise.all(
          selectedUsers.map(userId =>
            updateUserRole(userId, role, action)
          )
        );
      } else {
        // Status update
        await brain.update_user_status({
          token: {
            idToken: await user?.getIdToken()
          },
          user_ids: selectedUsers,
          action,
        });
      }

      setSelectedUsers([]);
      loadUsers(); // Refresh the list
      toast({
        title: "Success",
        description: `Bulk action completed successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete bulk action",
        variant: "destructive",
      });
    }
  };

  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getFilteredUsers = () => {
    return users.filter((user) => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.uid.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "all" || 
        user.roles.some(r => r.role === roleFilter);
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" ? user.is_active : !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  };

  const filteredUsers = getFilteredUsers();

  const handleBulkRoleAction = async (role: UserRole, action: UserAction) => {
    try {
      await Promise.all(
        selectedUsers.map(userId =>
          updateUserRole(userId, role, action)
        )
      );
      setSelectedUsers([]);
      toast({
        title: "Success",
        description: `Bulk action completed successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete bulk action",
        variant: "destructive",
      });
    }
  };

  const allSelected = useMemo(
    () => filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length,
    [filteredUsers, selectedUsers]
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsRolePermissionsOpen(true)}
          >
            Manage Permissions
          </Button>
          <Button onClick={loadUsers} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

        <div className="flex items-center space-x-4">
          <select
            className="p-2 border rounded-md"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="moderator">Moderators</option>
          </select>

          <select
            className="p-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="flex items-center space-x-2 bg-muted p-2 rounded-md">
          <span className="text-sm text-muted-foreground">
            {selectedUsers.length} users selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkRoleAction(UserRole.Admin, UserAction.Add)}
          >
            Make Admin
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkRoleAction(UserRole.Moderator, UserAction.Add)}
          >
            Make Moderator
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction(null, UserAction.Activate)}
          >
            Activate Users
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction(null, UserAction.Deactivate)}
          >
            Deactivate Users
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedUsers([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[300px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>
                <Checkbox
                  checked={selectedUsers.includes(user.uid)}
                  onCheckedChange={(checked) => handleSelectUser(user.uid, checked as boolean)}
                  aria-label={`Select ${user.email}`}
                />
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="font-mono">{user.uid}</TableCell>
              <TableCell>
                {user.roles.map((role) => role.role).join(", ")}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProfileUserId(user.uid)}
                    >
                      View Profile
                    </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateUserRole(
                        user.uid,
                        UserRole.Admin,
                        user.roles.some((r) => r.role === "admin")
                          ? UserAction.Remove
                          : UserAction.Add,
                      )
                    }
                  >
                    {user.roles.some((r) => r.role === "admin")
                      ? "Remove Admin"
                      : "Make Admin"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateUserRole(
                        user.uid,
                        UserRole.Moderator,
                        user.roles.some((r) => r.role === "moderator")
                          ? UserAction.Remove
                          : UserAction.Add,
                      )
                    }
                  >
                    {user.roles.some((r) => r.role === "moderator")
                      ? "Remove Moderator"
                      : "Make Moderator"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
        </TabsContent>

        <TabsContent value="activity">
          <UserActivityLogs />
        </TabsContent>
      </Tabs>

      <RolePermissionsDialog
        open={isRolePermissionsOpen}
        onOpenChange={setIsRolePermissionsOpen}
        onPermissionsUpdate={loadUsers}
      />

      <UserProfileDialog
        userId={selectedProfileUserId}
        open={!!selectedProfileUserId}
        onOpenChange={(open) => !open && setSelectedProfileUserId("")}
        onProfileUpdate={loadUsers}
      />
    </div>
  );
};
