import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyAdmin2fa } from "@/lib/server/admin";

export const Route = createFileRoute("/bode/verify")({ component: Verify });

function Verify() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <form
        className="w-full max-w-sm space-y-3 rounded-xl border border-border bg-card p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await verifyAdmin2fa({ data: { code } });
            nav({ to: "/bode" });
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Sai mã");
          }
        }}
      >
        <Logo />
        <h1 className="text-xl font-semibold">Xác thực 2FA</h1>
        <Input placeholder="Mã 6 số" value={code} onChange={(e) => setCode(e.target.value)} />
        <Button className="w-full">Xác nhận</Button>
      </form>
    </main>
  );
}
