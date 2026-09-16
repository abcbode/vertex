import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CandlestickChart,
  Home,
  Headset,
  UserRound,
  Wallet,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";
import { vnd } from "@/lib/format";
import { getBootstrap } from "@/lib/server/core";
import { recordLogin } from "@/lib/server/user";
import { markRead } from "@/lib/server/cms";

const NAV = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/trade", label: "Trade", icon: CandlestickChart },
  { to: "/wallet", label: "Ví", icon: Wallet },
  { to: "/support", label: "CSKH", icon: Headset },
  { to: "/account", label: "Tài khoản", icon: UserRound },
] as const;

export function AppShell({
  children,
  requireAuth = true,
}: {
  children: ReactNode;
  requireAuth?: boolean;
}) {
  const { user, isPending } = useCurrentUserState();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [boot, setBoot] = useState<Awaited<ReturnType<typeof getBootstrap>> | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let live = true;
    getBootstrap()
      .then((b) => {
        if (!live) return;
        setBoot(b);
        if (b.popup) setPopupOpen(true);
      })
      .catch(() => {});
    recordLogin().catch(() => {});
    return () => {
      live = false;
    };
  }, [user]);

  if (isPending && requireAuth) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <header className="flex h-14 items-center justify-between border-b border-border px-4">
          <Logo />
          <Skeleton className="h-8 w-24" />
        </header>
        <div className="flex-1 p-4">
          <p className="text-sm text-muted-foreground">Đang tải VERTEX…</p>
          <Skeleton className="mt-4 h-40 w-full" />
        </div>
      </div>
    );
  }
  if (requireAuth && !user) return <RedirectToSignIn />;

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-16 md:pb-0">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
        <Link to="/" className="shrink-0">
          <Logo compact={false} />
        </Link>
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground",
                path === n.to && "bg-accent text-foreground",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {isPending ? (
            <Skeleton className="h-8 w-24" />
          ) : user ? (
            <>
              <div className="hidden rounded-md border border-border px-3 py-1.5 text-sm tabular md:block">
                {vnd(boot?.wallet.balance ?? 0)}
              </div>
              <Link to="/notifications" className="relative grid size-11 place-items-center rounded-md hover:bg-accent">
                <Bell className="size-4" />
                {(boot?.unread ?? 0) > 0 && (
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-down" />
                )}
              </Link>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Đăng nhập</Link>
            </Button>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <nav className="fixed right-0 bottom-0 left-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map((n) => {
          const Icon = n.icon;
          const on = path === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground",
                on && "text-foreground",
              )}
            >
              <Icon className="size-5" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <Dialog
        open={popupOpen}
        onOpenChange={(o) => {
          setPopupOpen(o);
          if (!o && boot?.popup) markRead({ data: { id: boot.popup.id } }).catch(() => {});
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{boot?.popup?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{boot?.popup?.body}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
