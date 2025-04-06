import { useEffect, useState } from "react";
import brain from "brain";
import { fetchRolePermissions } from "./apiHelpers";

export type UserRole = "super_admin" | "admin" | "moderator";

export function useRolePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      // Use wrapper function to avoid GET with body issues
      const data = await fetchRolePermissions();
      setPermissions(data.permissions);
      setError(null);
    } catch (err) {
      setError("Failed to fetch permissions");
      console.error("Error fetching permissions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return { permissions, isLoading, error };
}

export function useRequireRole(requiredRole: UserRole) {
  const { permissions, isLoading, error } = useRolePermissions();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Role hierarchy: super_admin > admin > moderator
    const roleHierarchy: Record<UserRole, number> = {
      super_admin: 3,
      admin: 2,
      moderator: 1,
    };

    const requiredLevel = roleHierarchy[requiredRole];

    // Check if user has any role that meets or exceeds the required level
    const hasRequiredRole = Object.entries(roleHierarchy).some(
      ([role, level]) =>
        level >= requiredLevel && permissions.includes(`role:${role}`)
    );

    setHasAccess(hasRequiredRole);
  }, [permissions, requiredRole]);

  return { hasAccess, isLoading, error };
}
