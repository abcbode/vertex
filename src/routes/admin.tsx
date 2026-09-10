import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminArea,
});

function AdminArea() {
  return <Outlet />;
}
