"use client";

import { Button, Tooltip } from "@heroui/react";

export default function TooltipIcon({
  content,
  icon,
  onPress,
  isIconOnly = true,
  size = "sm",
  variant = "faded",
  color = "default",
  isLoading = false,
  isDisabled = false,
  title,
  tooltipPosition = "top",
  tooltip = false,
}: {
  tooltip?: boolean;
  content: string;
  icon: React.ReactNode;
  onPress: () => void;
  isIconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  variant?:
    | "shadow"
    | "faded"
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "ghost"
    | undefined;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | undefined;
  isLoading?: boolean;
  isDisabled?: boolean;
  title?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
}) {
  if (tooltip) {
    return (
      <Tooltip content={content} placement={tooltipPosition}>
        <Button
          isIconOnly={isIconOnly}
          aria-label={content}
          variant={variant}
          color={color}
          size={size}
          onPress={onPress}
          isLoading={isLoading}
          isDisabled={isDisabled}
        >
          {icon}
          {title}
        </Button>
      </Tooltip>
    );
  } else {
    return (
      <Button
        isIconOnly={isIconOnly}
        aria-label={content}
        variant={variant}
        color={color}
        size={size}
        onPress={onPress}
        isLoading={isLoading}
        isDisabled={isDisabled}
      >
        {icon}
        {title}
      </Button>
    );
  }
}
