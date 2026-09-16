import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Phone, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listSupportPublic } from "@/lib/server/cms";

export const Route = createFileRoute("/support")({ component: SupportPage });

function SupportPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listSupportPublic>>>([]);
  useEffect(() => {
    listSupportPublic().then(setRows).catch(() => {});
  }, []);
  return (
    <AppShell requireAuth={false}>
      <div className="mx-auto max-w-xl space-y-4 p-4">
        <h1 className="text-xl font-semibold">Chăm sóc khách hàng</h1>
        <p className="text-sm text-muted-foreground">Liên hệ trực tiếp qua Telegram, Zalo hoặc điện thoại.</p>
        {rows.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex gap-4 p-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-lg font-medium">
                {a.name.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{a.name}</div>
                <p className="text-sm text-muted-foreground">{a.bio}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {a.telegram && (
                    <Button asChild size="sm" variant="outline">
                      <a href={a.telegram} target="_blank" rel="noreferrer"><Send className="size-3" /> Telegram</a>
                    </Button>
                  )}
                  {a.zalo && (
                    <Button asChild size="sm" variant="outline">
                      <a href={a.zalo} target="_blank" rel="noreferrer"><MessageCircle className="size-3" /> Zalo</a>
                    </Button>
                  )}
                  {a.messenger && (
                    <Button asChild size="sm" variant="outline">
                      <a href={a.messenger} target="_blank" rel="noreferrer">Messenger</a>
                    </Button>
                  )}
                  {a.phone && (
                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:${a.phone}`}><Phone className="size-3" /> {a.phone}</a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
