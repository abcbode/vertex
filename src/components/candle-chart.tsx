import { useCallback, useEffect, useRef, useState } from "react";
import { LocateFixed, ZoomIn, ZoomOut } from "lucide-react";
import type { Candle } from "@/lib/server/market";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PriceLevel = {
  price: number;
  tone: "up" | "down";
  label: string;
};

function mergeCandles(live: Candle[], hist: Candle[]) {
  const map = new Map<number, Candle>();
  for (const c of hist) map.set(c.time, c);
  for (const c of live) map.set(c.time, c);
  return [...map.values()].sort((a, b) => a.time - b.time);
}

export function CandleChart({
  candles,
  history = [],
  decimals,
  levels = [],
  onNeedHistory,
  resetKey,
}: {
  candles: Candle[];
  history?: Candle[];
  decimals: number;
  levels?: PriceLevel[];
  onNeedHistory?: () => void;
  resetKey?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  const all = mergeCandles(candles, history);
  const [viewCount, setViewCount] = useState(48);
  const [offset, setOffset] = useState(0);
  const [hover, setHover] = useState<Candle | null>(null);
  const drag = useRef<{
    id: number;
    x: number;
    pointers: Map<number, { x: number; y: number }>;
    pinch: number | null;
    moved: boolean;
  }>({ id: -1, x: 0, pointers: new Map(), pinch: null, moved: false });
  const askedLen = useRef(-1);
  const follow = offset <= 0;
  const count = Math.max(12, Math.min(viewCount, Math.max(12, all.length)));
  const maxOff = Math.max(0, all.length - count);
  const off = Math.min(Math.max(0, offset), maxOff);
  const end = follow ? all.length : all.length - off;
  const start = Math.max(0, end - count);
  const data = all.length ? all.slice(start, end) : [];

  useEffect(() => {
    askedLen.current = -1;
    setOffset(0);
    setViewCount(48);
    setHover(null);
  }, [resetKey]);

  useEffect(() => {
    if (start <= 8 && all.length < 180 && all.length !== askedLen.current) {
      askedLen.current = all.length;
      onNeedHistory?.();
    }
  }, [start, all.length, onNeedHistory]);

  const zoomBy = useCallback((factor: number) => {
    setViewCount((v) => Math.round(Math.min(180, Math.max(16, v * factor))));
  }, []);

  const goLive = useCallback(() => {
    setOffset(0);
    setHover(null);
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    const parent = wrapRef.current;
    if (!canvas || !parent) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cs = getComputedStyle(document.documentElement);
      const muted = cs.getPropertyValue("--color-muted-foreground").trim() || "#8b919c";
      const up = cs.getPropertyValue("--color-up").trim() || "#3dba80";
      const down = cs.getPropertyValue("--color-down").trim() || "#e05656";
      const border = cs.getPropertyValue("--color-border").trim() || "#262c36";
      const fg = cs.getPropertyValue("--color-foreground").trim() || "#e8eaed";

      const padL = 8;
      const padR = 64;
      const padT = 16;
      const padB = 28;
      const series = data.length ? data : [{ time: Date.now(), open: 1, high: 1, low: 1, close: 1 }];
      const refPrice = series[series.length - 1]?.close || series[0].close || 1;
      const clustered = series.filter((c) => Math.abs(c.close - refPrice) / refPrice < 0.02);
      const use = clustered.length >= 6 ? clustered : series.slice(-Math.min(24, series.length));
      let min = Math.min(...use.map((c) => c.low));
      let max = Math.max(...use.map((c) => c.high));
      for (const lv of levels) {
        if (Math.abs(lv.price - refPrice) / refPrice < 0.025) {
          min = Math.min(min, lv.price);
          max = Math.max(max, lv.price);
        }
      }
      if (min === max) {
        min -= min * 0.002 || 0.002;
        max += max * 0.002 || 0.002;
      }
      const pad = (max - min) * 0.14 || max * 0.002;
      min -= pad;
      max += pad;
      const span = max - min || 1;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const slot = plotW / series.length;
      const yOf = (v: number) => padT + ((max - v) / span) * plotH;

      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillStyle = muted;
      ctx.textAlign = "left";
      for (let i = 0; i <= 4; i++) {
        const v = max - (span * i) / 4;
        const y = yOf(v);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(w - padR + 8, y);
        ctx.stroke();
        ctx.fillText(v.toFixed(decimals), w - padR + 12, y + 4);
      }
      ctx.setLineDash([]);

      series.forEach((c, i) => {
        const x = padL + i * slot + slot / 2;
        const bull = c.close >= c.open;
        const active = hover && hover.time === c.time;
        ctx.strokeStyle = bull ? up : down;
        ctx.fillStyle = bull ? up : down;
        ctx.globalAlpha = active ? 1 : 0.92;
        ctx.lineWidth = active ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(x, yOf(c.high));
        ctx.lineTo(x, yOf(c.low));
        ctx.stroke();
        const y1 = yOf(Math.max(c.open, c.close));
        const y2 = yOf(Math.min(c.open, c.close));
        const bw = Math.max(3, slot * 0.62);
        const bh = Math.max(1, y2 - y1);
        ctx.fillRect(x - bw / 2, y1, bw, bh);
        ctx.globalAlpha = 1;
      });

      levels.forEach((lv) => {
        const y = yOf(lv.price);
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = lv.tone === "up" ? up : down;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(w - padR, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = lv.tone === "up" ? up : down;
        ctx.textAlign = "left";
        ctx.fillText(lv.label, padL + 4, y - 5);
      });

      const last = series[series.length - 1];
      const py = yOf(last.close);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = last.close >= last.open ? up : down;
      ctx.beginPath();
      ctx.moveTo(padL, py);
      ctx.lineTo(w - padR, py);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = last.close >= last.open ? up : down;
      const label = last.close.toFixed(decimals);
      ctx.fillRect(w - padR + 8, py - 9, 54, 16);
      ctx.fillStyle = "#0a0c10";
      ctx.textAlign = "center";
      ctx.fillText(label, w - padR + 35, py + 3);

      ctx.fillStyle = muted;
      ctx.textAlign = "left";
      if (series.length > 1) {
        const first = series[0];
        const fmt = (t: number) =>
          new Date(t).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        ctx.fillText(fmt(first.time), padL, h - 8);
        ctx.textAlign = "right";
        ctx.fillText(fmt(last.time), w - padR, h - 8);
      }

      if (hover) {
        const idx = series.findIndex((c) => c.time === hover.time);
        if (idx >= 0) {
          const x = padL + idx * slot + slot / 2;
          ctx.strokeStyle = fg;
          ctx.globalAlpha = 0.25;
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.moveTo(x, padT);
          ctx.lineTo(x, h - padB);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [data, decimals, levels, hover]);

  function candleAt(clientX: number): Candle | null {
    const parent = wrapRef.current;
    if (!parent || !data.length) return null;
    const rect = parent.getBoundingClientRect();
    const padL = 8;
    const padR = 64;
    const plotW = rect.width - padL - padR;
    const x = clientX - rect.left - padL;
    const i = Math.floor((x / plotW) * data.length);
    if (i < 0 || i >= data.length) return null;
    return data[i] ?? null;
  }

  function onPointerDown(e: React.PointerEvent) {
    const st = drag.current;
    st.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    st.id = e.pointerId;
    st.x = e.clientX;
    st.moved = false;
    if (st.pointers.size === 2) {
      const pts = [...st.pointers.values()];
      st.pinch = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const st = drag.current;
    if (st.pointers.has(e.pointerId)) st.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (st.pointers.size >= 2) {
      const pts = [...st.pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (st.pinch && dist > 0) {
        const ratio = dist / st.pinch;
        if (ratio > 1.06) {
          zoomBy(0.85);
          st.pinch = dist;
        } else if (ratio < 0.94) {
          zoomBy(1.15);
          st.pinch = dist;
        }
      }
      return;
    }

    if (st.id === e.pointerId && st.pointers.size === 1) {
      const dx = e.clientX - st.x;
      if (Math.abs(dx) > 4) st.moved = true;
      const parent = wrapRef.current;
      if (!parent || !data.length) return;
      const slot = (parent.clientWidth - 72) / data.length;
      const steps = Math.round(dx / Math.max(6, slot));
      if (steps !== 0) {
        st.x = e.clientX;
        setOffset((o) => Math.max(0, o + steps));
      }
    }

    if (!st.moved) setHover(candleAt(e.clientX));
  }

  function onPointerUp(e: React.PointerEvent) {
    const st = drag.current;
    st.pointers.delete(e.pointerId);
    if (st.pointers.size < 2) st.pinch = null;
    if (st.id === e.pointerId) st.id = -1;
    if (!st.moved) setHover(candleAt(e.clientX));
  }

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      if (Math.abs(ev.deltaY) >= Math.abs(ev.deltaX)) {
        zoomBy(ev.deltaY > 0 ? 1.12 : 0.88);
      } else {
        const dir = ev.deltaX > 0 ? 1 : -1;
        setOffset((o) => Math.max(0, o + dir * 2));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={wrapRef}
        className="h-full w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          drag.current.pointers.clear();
          setHover(null);
        }}
      >
        <canvas ref={ref} className="h-full w-full cursor-crosshair" />
      </div>
      <div className="pointer-events-none absolute left-2 top-2 z-10 flex gap-1">
        <Button type="button" size="icon" variant="secondary" className="pointer-events-auto size-9" onClick={() => zoomBy(0.8)} aria-label="Phóng to">
          <ZoomIn />
        </Button>
        <Button type="button" size="icon" variant="secondary" className="pointer-events-auto size-9" onClick={() => zoomBy(1.25)} aria-label="Thu nhỏ">
          <ZoomOut />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={follow ? "outline" : "secondary"}
          className={cn("pointer-events-auto size-9", !follow && "border-ring")}
          onClick={goLive}
          aria-label="Về nến hiện tại"
        >
          <LocateFixed />
        </Button>
      </div>
      <p className="pointer-events-none absolute bottom-7 left-2 text-[10px] text-muted-foreground">
        {follow ? "Vuốt / lăn để xem lịch sử · +/- để zoom" : "Đang xem lịch sử"}
      </p>
      {hover ? (
        <div className="pointer-events-none absolute right-16 top-2 rounded-md border border-border bg-card/95 px-2 py-1 font-mono text-[11px] shadow">
          <div>{new Date(hover.time).toLocaleString("vi-VN")}</div>
          <div className={hover.close >= hover.open ? "text-up" : "text-down"}>
            O {hover.open.toFixed(decimals)} H {hover.high.toFixed(decimals)} L {hover.low.toFixed(decimals)} C {hover.close.toFixed(decimals)}
          </div>
        </div>
      ) : null}
    </div>
  );
}