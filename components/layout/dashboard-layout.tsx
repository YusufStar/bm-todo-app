"use client";

import type { SidebarItem } from "./sidebar";

import React, {  useMemo } from "react";
import {
    User,
    Badge,
    Avatar,
    Button,
    ScrollShadow,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@heroui/react";
import * as LucideIcons from "lucide-react";

import Sidebar from "./sidebar";
import { Logo } from "../icons";
import { usePathname, useParams } from "next/navigation";
import { User as UserType } from "@prisma/client";
import { logout } from "@/actions/auth/logout";
import { CompanySelector } from "@/components/company-selector";

const sidebarItemsWithDashboard: SidebarItem[] = [
    {
        title: "Home",
        icon: "Home",
        href: "/dashboard",
        key: "/dashboard",
    },
    {
        title: "Projects",
        icon: "Briefcase",
        href: "/dashboard/projects",
        key: "/dashboard/projects",
    },
    {
        title: "Members",
        icon: "Users",
        href: "/dashboard/members",
        key: "/dashboard/members",
    },
    {
        title: "Organizations",
        icon: "Building",
        href: "/dashboard/organizations",
        key: "/dashboard/organizations",
    },
    {
        title: "Invitations",
        icon: "Mail",
        href: "/dashboard/invitations",
        key: "/dashboard/invitations",
    },
    {
        title: "Settings",
        icon: "Settings",
        href: "/dashboard/settings",
        key: "/dashboard/settings",
    },
];

const sidebarItemsWithProject = (projectId: string): SidebarItem[] => [
    {
        title: "Project",
        icon: "Briefcase",
        href: `/dashboard/project/${projectId}`,
        key: `/dashboard/project/${projectId}`,
    },
    {
        title: "Tasks",
        icon: "CheckSquare",
        href: `/dashboard/project/${projectId}/tasks`,
        key: `/dashboard/project/${projectId}/tasks`,
    },
    {
        title: "Members",
        icon: "Users",
        href: `/dashboard/project/${projectId}/members`,
        key: `/dashboard/project/${projectId}/members`,
    },
    {
        title: "Darkboard",
        icon: "Palette",
        href: `/dashboard/project/${projectId}/darkboard`,
        key: `/dashboard/project/${projectId}/darkboard`,
    },
    {
        title: "Documents",
        icon: "FileText",
        href: `/dashboard/project/${projectId}/documents`,
        key: `/dashboard/project/${projectId}/documents`,
    },
    {
        title: "Assets",
        icon: "FolderOpen",
        href: `/dashboard/project/${projectId}/assets`,
        key: `/dashboard/project/${projectId}/assets`,
    },
    {
        title: "Calendar",
        icon: "Calendar",
        href: `/dashboard/project/${projectId}/calendar`,
        key: `/dashboard/project/${projectId}/calendar`,
    },
    {
        title: "Chat",
        icon: "MessageSquare",
        href: `/dashboard/project/${projectId}/chat`,
        key: `/dashboard/project/${projectId}/chat`,
    },
    {
        title: "Settings",
        icon: "Settings",
        href: `/dashboard/project/${projectId}/settings`,
        key: `/dashboard/project/${projectId}/settings`,
    },
];

export default function DashboardLayout({
    children,
    user,
}: {
    children: React.ReactNode;
    user: UserType | null;
}) {
    const pathname = usePathname();
    const params = useParams();

    // Use useMemo instead of useState + useEffect to avoid hydration issues
    const projectId = useMemo(() => {
        return params?.projectId as string || null;
    }, [params]);

    // Determine which sidebar items to use based on projectId
    const sidebarItemsData = useMemo(() => {
        return projectId
            ? sidebarItemsWithProject(projectId)
            : sidebarItemsWithDashboard;
    }, [projectId]);

    return (
        <div className="h-screen flex w-full">
            <div className="relative flex h-full w-96 flex-col border-r-small border-divider p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-2" role="banner">
                        <Logo className="w-6 h-6" aria-label="Company Logo" />
                    </div>
                    {/* Notifications */}
                    <Popover offset={12} placement="bottom-start">
                        <PopoverTrigger>
                            <Button
                                disableRipple
                                isIconOnly
                                className="overflow-visible"
                                radius="full"
                                variant="light"
                                aria-label="Notifications"
                            >
                                <Badge
                                    color="danger"
                                    content="5"
                                    showOutline={false}
                                    size="md"
                                    aria-label="5 unread notifications"
                                >
                                    <LucideIcons.Bell className="text-default-500" size={22} aria-hidden="true" />
                                </Badge>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="max-w-[90vw] p-0 sm:max-w-[380px]">
                            <div className="flex flex-col gap-y-2">
                                test notifications list !!!
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Company Selector */}
                <CompanySelector />

                <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
                    <Sidebar
                        defaultSelectedKey={pathname || "/dashboard"}
                        iconClassName="group-data-[selected=true]:text-primary-foreground"
                        itemClasses={{
                            base: "data-[selected=true]:bg-primary-400 dark:data-[selected=true]:bg-primary-300 data-[hover=true]:bg-default-300/20 dark:data-[hover=true]:bg-default-200/40",
                            title: "group-data-[selected=true]:text-primary-foreground",
                        }}
                        items={sidebarItemsData}
                    />
                </ScrollShadow>

                <Dropdown placement="top">
                    <DropdownTrigger>
                        <Button
                            className="mb-4 h-14 items-center justify-between"
                            variant="light"
                            aria-label="User account menu"
                        >
                            <User
                                avatarProps={{
                                    size: "sm",
                                    isBordered: false,
                                    src: user?.avatar || "",
                                    name: user?.username || "",
                                }}
                                className="justify-start transition-transform"
                                description={user?.email || ""}
                                name={user?.username || ""}
                            />
                            <LucideIcons.ChevronsUpDown
                                className="text-default-400"
                                size={16}
                                aria-label="Toggle dropdown"
                            />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Account Detail"
                        variant="faded"
                        classNames={{
                            base: "p-0",
                            list: "py-1 px-1 min-w-[250px]",
                        }}
                    >
                        {user && (
                            <>
                                <DropdownItem
                                    key={user.id}
                                    textValue={user.username}
                                    isReadOnly
                                    showDivider
                                    classNames={{
                                        base: "py-2",
                                        description: "text-tiny",
                                    }}
                                >
                                    <div className="flex items-center gap-x-2">
                                        <Avatar
                                            alt={user.username}
                                            classNames={{
                                                base: "flex-shrink-0 h-8 w-8",
                                                img: "transition-none",
                                            }}
                                            size="sm"
                                            src={user.avatar || ""}
                                            name={user.username || ""}
                                            aria-label={`${user.username}'s profile picture`}
                                        />
                                        <div className="flex flex-col">
                                            <p className="text-small font-medium text-default-600">
                                                {user.username}
                                            </p>
                                            <p className="text-tiny text-default-400">{user.email}</p>
                                        </div>
                                    </div>
                                </DropdownItem>
                                <DropdownItem
                                    key="account"
                                    classNames={{
                                        base: "py-1",
                                        description: "text-tiny",
                                    }}
                                >
                                    Account
                                </DropdownItem>
                                <DropdownItem
                                    key="feedback"
                                    classNames={{
                                        base: "py-1",
                                        description: "text-tiny",
                                    }}
                                >
                                    Feedback
                                </DropdownItem>
                                <DropdownItem
                                    key="bug"
                                    showDivider
                                    classNames={{
                                        base: "py-1",
                                        description: "text-tiny",
                                    }}
                                >
                                    Bug Report
                                </DropdownItem>
                                <DropdownItem
                                    key="logout"
                                    color="danger"
                                    onClick={async () => {
                                        await logout();
                                    }}
                                    classNames={{
                                        base: "py-1",
                                        description: "text-tiny",
                                    }}
                                >
                                    Logout
                                </DropdownItem>
                            </>
                        )}
                    </DropdownMenu>
                </Dropdown>
            </div>

            <div className="w-full overflow-y-auto h-full p-6" role="main">
                {children}
            </div>
        </div>
    );
}
