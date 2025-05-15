"use client";

import * as Icons from "lucide-react";

export const iconOptions = [
  "User",
  "Users",
  "Rocket",
  "Calendar",
  "Folder",
  "Star",
  "Briefcase",
  "Grid",
  "Settings",
  "Check",
  "AlertCircle",
  "Bell",
  "Camera",
  "Circle",
  "Clock",
  "Code",
  "Cpu",
  "Database",
  "Eye",
  "File",
  "Flag",
  "Gift",
  "Globe",
  "Heart",
  "Home",
  "Image",
  "Inbox",
  "Key",
  "Link",
  "List",
  "Lock",
  "Map",
  "Menu",
  "MessageCircle",
  "Monitor",
  "Moon",
  "Music",
  "Phone",
  "Play",
  "Plus",
  "Power",
  "RefreshCcw",
  "Search",
  "Send",
  "Share",
  "Shield",
  "ShoppingCart",
  "Smile",
  "Sun",
  "Terminal",
  "Trash",
  "TrendingUp",
  "Upload",
  "UserCheck",
  "Video",
  "Volume2",
  "Wifi",
  "X",
  "Zap",
  "GalleryVerticalEnd",
  "AudioWaveform",
  "Command",
] as const


export const LucideIcons: Record<typeof iconOptions[number], React.FC<React.SVGProps<SVGSVGElement>>> = iconOptions.reduce(
  (acc, iconName) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.FC<React.SVGProps<SVGSVGElement>>;
    if (IconComponent) {
      acc[iconName] = IconComponent;
    }
    return acc;
  },
  {} as Record<typeof iconOptions[number], React.FC<React.SVGProps<SVGSVGElement>>>
);

export const LucideIconNames = iconOptions;