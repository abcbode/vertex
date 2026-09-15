import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/bode")({
  component: AdminArea,
});

function AdminArea() {
  return <Outlet />;
}
