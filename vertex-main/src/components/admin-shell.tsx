import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Building2,
  CandlestickChart,
  Gauge,
  Headset,
  Menu,
  QrCode,
  Settings,
  SlidersHorizontal,
  Users,
  BarChart3,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { adminPing, prepareAdminLogin } from "@/lib/server/admin";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/bode", label: "Dashboard", icon: Gauge },
  { to: "/bode/results", label: "Chỉnh kết quả", icon: SlidersHorizontal },
  { to: "/bode/users", label: "User", icon: Users },
  { to: "/bode/deposits", label: "Nạp tiền", icon: ArrowDownToLine },
  { to: "/bode/withdrawals", label: "Rút tiền", icon: ArrowUpFromLine },
  { to: "/bode/trade", label: "Trade", icon: CandlestickChart },
  { to: "/bode/banks", label: "Ngân hàng", icon: Building2 },
  { to: "/bode/qr", label: "QR Code", icon: QrCode },
  { to: "/bode/support", label: "CSKH", icon: Headset },
  { to: "/bode/notifications", label: "Thông báo", icon: Bell },
  { to: "/bode/reports", label: "Báo cáo", icon: BarChart3 },
  { to: "/bode/settings", label: "Cài đặt", icon: Settings },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [gate, setGate] = useState<"load" | "ok" | "no" | "2fa">("load");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    prepareAdminLogin().catch(() => {});
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setGate("no");
      return;
    }
    adminPing()
      .then((p) => {
        if (!p.isAdmin) setGate("no");
        else if (!p.twoFaOk) setGate("2fa");
        else setGate("ok");
      })
      .catch(() => setGate("no"));
  }, [user, isPending, path]);

  if (gate === "2fa" && path !== "/bode/verify") {
    return <Navigate to="/bode/verify" />;
  }

  const isAdmin = gate === "ok" || (gate === "2fa" && path === "/bode/verify");
  if (!isAdmin) {
    return <AdminLoginForm onSuccess={() => setGate("ok")} />;
  }

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {ITEMS.map((it) => {
        const Icon = it.icon;
        const on = it.to === "/bode" ? path === "/bode" || path === "/bode/" : path.startsWith(it.to);
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
              on && "bg-accent text-foreground",
            )}
          >
            <Icon className="size-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-56 shrink-0 border-r border-border md:block">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        {nav}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border px-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <span className="text-sm text-muted-foreground">Quản trị</span>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => void signOut("/bode")}
            >
              Đăng xuất
            </button>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Về sàn
            </Link>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0">
          <div className="flex h-14 items-center border-b border-border px-4">
            <Logo />
          </div>
          {nav}
        </SheetContent>
      </Sheet>
    </div>
  );
}
