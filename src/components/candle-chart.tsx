import { useEffect, useRef } from "react";
import type { Candle } from "@/lib/server/market";

export type PriceLevel = {
  price: number;
  tone: "up" | "down";
  label: string;
};

export function CandleChart({
  candles,
  decimals,
  levels = [],
}: {
  candles: Candle[];
  decimals: number;
  levels?: PriceLevel[];
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

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

      const padL = 8;
      const padR = 64;
      const padT = 16;
      const padB = 24;
      const data = candles.length ? candles : [{ time: Date.now(), open: 1, high: 1, low: 1, close: 1 }];
      let min = Math.min(...data.map((c) => c.low), ...levels.map((l) => l.price));
      let max = Math.max(...data.map((c) => c.high), ...levels.map((l) => l.price));
      if (min === max) {
        min -= min * 0.002;
        max += max * 0.002;
      }
      const span = max - min || 1;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const slot = plotW / data.length;
      const yOf = (v: number) => padT + ((max - v) / span) * plotH;

      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      const steps = 4;
      ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillStyle = muted;
      ctx.textAlign = "left";
      for (let i = 0; i <= steps; i++) {
        const v = max - (span * i) / steps;
        const y = yOf(v);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(w - padR + 8, y);
        ctx.stroke();
        ctx.fillText(v.toFixed(decimals), w - padR + 12, y + 4);
      }
      ctx.setLineDash([]);

      data.forEach((c, i) => {
        const x = padL + i * slot + slot / 2;
        const bull = c.close >= c.open;
        ctx.strokeStyle = bull ? up : down;
        ctx.fillStyle = bull ? up : down;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yOf(c.high));
        ctx.lineTo(x, yOf(c.low));
        ctx.stroke();
        const y1 = yOf(Math.max(c.open, c.close));
        const y2 = yOf(Math.min(c.open, c.close));
        const bw = Math.max(3, slot * 0.62);
        const bh = Math.max(1, y2 - y1);
        ctx.fillRect(x - bw / 2, y1, bw, bh);
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

      const last = data[data.length - 1];
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
      if (data.length > 1) {
        const first = data[0];
        ctx.fillText(new Date(first.time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), padL, h - 8);
        ctx.textAlign = "right";
        ctx.fillText(new Date(last.time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), w - padR, h - 8);
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [candles, decimals, levels]);

  return <canvas ref={ref} className="h-full w-full" />;
}
