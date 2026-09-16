import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { adminPing, prepareAdminLogin } from "@/lib/server/admin";

export const Route = createFileRoute("/bode/login")({ component: AdminLogin });

function AdminLogin() {
  const { user, isPending } = useCurrentUserState();
  const [alreadyAdmin, setAlreadyAdmin] = useState(false);

  useEffect(() => {
    prepareAdminLogin().catch(() => {});
  }, []);

  useEffect(() => {
    if (isPending || !user) return;
    adminPing()
      .then((p) => {
        if (p.isAdmin && p.twoFaOk) setAlreadyAdmin(true);
      })
      .catch(() => {});
  }, [user, isPending]);

  if (alreadyAdmin) return <Navigate to="/bode" />;
  return <AdminLoginForm />;
}
