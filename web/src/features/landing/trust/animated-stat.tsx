"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";

import { easePremium } from "@/lib/motion";

interface AnimatedStatProps {
  value: number;
  start: boolean;
  reduceMotion: boolean;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

const numberFormatter = new Intl.NumberFormat("en-IN");

export function AnimatedStat({
  value,
  start,
  reduceMotion,
  decimals = 0,
  prefix = "",
  suffix = "",
}: AnimatedStatProps) {
  const outputRef = useRef<HTMLSpanElement>(null);
  const currentValue = useMotionValue(reduceMotion ? value : 0);

  useMotionValueEvent(currentValue, "change", (latest) => {
    if (!outputRef.current) return;

    const formatted =
      decimals > 0
        ? latest.toFixed(decimals)
        : numberFormatter.format(Math.round(latest));
    outputRef.current.textContent = `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (!start) return;

    if (reduceMotion) {
      currentValue.set(value);
      return;
    }

    const controls = animate(currentValue, value, {
      duration: 1.2,
      ease: easePremium,
    });

    return () => controls.stop();
  }, [currentValue, reduceMotion, start, value]);

  const initialValue = reduceMotion ? value : decimals > 0 ? (0).toFixed(decimals) : "0";

  return (
    <span ref={outputRef} aria-label={`${prefix}${value}${suffix}`}>
      {prefix}
      {initialValue}
      {suffix}
    </span>
  );
}
