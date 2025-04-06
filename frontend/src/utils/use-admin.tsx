import { useEffect, useState } from "react";
import brain from "brain";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const response = await brain.get_admin_role_permissions({ body: {} });
        const data = await response.json();
        // If we can successfully fetch admin permissions, user is an admin
        setIsAdmin(true);
      } catch (error) {
        // If we get an error, user is not an admin
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, []);

  return { isAdmin, loading };
}
