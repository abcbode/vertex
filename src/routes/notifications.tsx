import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { listNotifications, markRead } from "@/lib/server/cms";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({ component: NotiPage });

function NotiPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listNotifications>>>([]);
  function load() {
    listNotifications().then(setRows).catch(() => {});
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-3 p-4">
        <h1 className="text-xl font-semibold">Thông báo</h1>
        {rows.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => {
              if (!n.read) markRead({ data: { id: n.id } }).then(load).catch(() => {});
            }}
            className={cn("w-full rounded-xl border border-border p-4 text-left", !n.read && "border-ring")}
          >
            <div className="flex justify-between gap-2">
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
          </button>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Chưa có thông báo.</p>}
      </div>
    </AppShell>
  );
}
