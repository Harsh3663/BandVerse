import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

const widthClass = {
  narrow: "container-narrow",
  default: "container-default",
  wide: "container-wide",
} as const;

interface ContainerProps {
  children: ReactNode;
  /** Matches docs/DesignSystem.md § Layout container widths. */
  width?: keyof typeof widthClass;
  className?: string;
  as?: ElementType;
}

/**
 * The one place page/section widths are decided. Sections should never
 * hardcode `max-w-*` inline — using this component keeps every page's
 * content width traceable to the three widths the Design System defines
 * (720 / 1120 / 1320px), instead of arbitrary one-off values creeping in.
 */
export function Container({
  children,
  width = "default",
  className,
  as: Tag = "div",
}: ContainerProps) {
  return <Tag className={cn(widthClass[width], className)}>{children}</Tag>;
}
