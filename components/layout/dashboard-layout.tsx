"use client";

import type { SidebarItem } from "./sidebar";

import React from "react";
import {
    User,
    Badge,
    Avatar,
    Button,
    ScrollShadow,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectItem,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Spacer,
    SelectSection,
    cn,
} from "@heroui/react";
import * as LucideIcons from "lucide-react";

import Sidebar from "./sidebar";
import { Logo } from "../icons";
import { usePathname, useParams } from "next/navigation";
import { User as UserType } from "@prisma/client";
import { logout } from "@/actions/auth/logout";

const sidebarItemsWithDashboard: SidebarItem[] = [
    {
        key: "dashboard",
        title: "Home",
        icon: "Home",
        href: "/dashboard",
    },
    {
        key: "projects",
        title: "Projects",
        icon: "Briefcase",
        href: "/dashboard/projects",
    },
    {
        key: "members",
        title: "Members",
        icon: "Users",
        href: "/dashboard/members",
    },
    {
        key: "organizations",
        title: "Organizations",
        icon: "Building",
        href: "/dashboard/organizations",
    },
    {
        key: "invitations",
        title: "Invitations",
        icon: "Mail",
        href: "/dashboard/invitations",
    },
    {
        key: "settings",
        title: "Settings",
        icon: "Settings",
        href: "/dashboard/settings",
    },
];

const sidebarItemsWithProject = (projectId: string): SidebarItem[] => [
    {
        key: "project",
        title: "Project",
        icon: "Briefcase",
        href: `/dashboard/project/${projectId}`,
    },
    {
        key: "tasks",
        title: "Tasks",
        icon: "CheckSquare",
        href: `/dashboard/project/${projectId}/tasks`,
    },
    {
        key: "members",
        title: "Members",
        icon: "Users",
        href: `/dashboard/project/${projectId}/members`,
    },
    {
        key: "darkboard",
        title: "Darkboard",
        icon: "Palette",
        href: `/dashboard/project/${projectId}/darkboard`,
    },
    {
        key: "documents",
        title: "Documents",
        icon: "FileText",
        href: `/dashboard/project/${projectId}/documents`,
    },
    {
        key: "assets",
        title: "Assets",
        icon: "FolderOpen",
        href: `/dashboard/project/${projectId}/assets`,
    },
    {
        key: "calendar",
        title: "Calendar",
        icon: "Calendar",
        href: `/dashboard/project/${projectId}/calendar`,
    },
    {
        key: "chat",
        title: "Chat",
        icon: "MessageSquare",
        href: `/dashboard/project/${projectId}/chat`,
    },
    {
        key: "settings",
        title: "Settings",
        icon: "Settings",
        href: `/dashboard/project/${projectId}/settings`,
    },
];

const workspaces = [
    {
        value: "0",
        label: "Acme Inc.",
        items: [
            {
                value: "1",
                label: "Core workspace",
            },
            {
                value: "2",
                label: "Design workspace",
            },
            {
                value: "3",
                label: "Dev. workspace",
            },
            {
                value: "4",
                label: "Marketing workspace",
            },
        ],
    },
];

export default function DashboardLayout({
    children,
    user,
}: {
    children: React.ReactNode;
    user: UserType | null;
}) {
    const params = useParams();
    const pathname = usePathname();
    const currentPath = pathname.split("/")?.[1]

    const sidebarItems = params.projectId
        ? sidebarItemsWithProject(params.projectId as string)
        : sidebarItemsWithDashboard;

    return (
        <div className="h-screen flex w-full">
            <div className="relative flex h-full w-96 flex-col border-r-small border-divider p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-2">
                        <Logo className="w-6 h-6" />
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
                            >
                                <Badge
                                    color="danger"
                                    content="5"
                                    showOutline={false}
                                    size="md"
                                >
                                    <LucideIcons.Bell className="text-default-500" size={22} />
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

                <Spacer y={8} />

                <div className="flex flex-col gap-y-2">
                    <Select
                        disableSelectorIconRotation
                        aria-label="Select workspace"
                        className="px-1"
                        classNames={{
                            trigger:
                                "min-h-14 bg-transparent border-small border-default-200 dark:border-default-100 data-[hover=true]:border-default-500 dark:data-[hover=true]:border-default-200 data-[hover=true]:bg-transparent",
                        }}
                        defaultSelectedKeys={["1"]}
                        items={workspaces}
                        listboxProps={{
                            bottomContent: (
                                <Button
                                    className="bg-default-100 text-center text-foreground"
                                    size="sm"
                                    onPress={() => console.log("on create workspace")}
                                >
                                    New Workspace
                                </Button>
                            ),
                        }}
                        placeholder="Select workspace"
                        renderValue={(items) => {
                            return items.map((item) => (
                                <div key={item.key} className="ml-1 flex flex-col gap-y-0.5">
                                    <span className="text-tiny leading-4">Acme Inc.</span>
                                    <span className="text-tiny text-default-400">
                                        {item.data?.label}
                                    </span>
                                </div>
                            ));
                        }}
                        selectorIcon={
                            <LucideIcons.ChevronsUpDown color="hsl(var(--heroui-default-500))" />
                        }
                        startContent={
                            <div className="relative h-10 w-10 flex-none rounded-full border-small border-default-300">
                                <LucideIcons.Users
                                    className="ml-2 mt-2 text-default-500"
                                    size={24}
                                />
                            </div>
                        }
                    >
                        {(section) => (
                            <SelectSection
                                key={section.value}
                                hideSelectedIcon
                                showDivider
                                aria-label={section.label}
                                items={section.items}
                                title={section.label}
                            >
                                {/* @ts-ignore */}
                                {(item) => (
                                    <SelectItem
                                        key={item.value}
                                        aria-label={item.label}
                                        textValue={item.label}
                                    >
                                        <div className="flex flex-row items-center justify-between gap-1">
                                            <span>{item.label}</span>
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-small border-default-300">
                                                <LucideIcons.Users
                                                    className="text-default-500"
                                                    size={16}
                                                />
                                            </div>
                                        </div>
                                    </SelectItem>
                                )}
                            </SelectSection>
                        )}
                    </Select>
                    <Input
                        fullWidth
                        aria-label="search"
                        classNames={{
                            base: "px-1",
                            inputWrapper: "dark:bg-default-50",
                        }}
                        labelPlacement="outside"
                        placeholder="Search..."
                        startContent={
                            <LucideIcons.Search
                                className="text-default-500 [&>g]:stroke-[2px]"
                                size={18}
                            />
                        }
                    />
                </div>

                <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
                    <Sidebar
                        defaultSelectedKey={currentPath}
                        iconClassName="group-data-[selected=true]:text-primary-foreground"
                        itemClasses={{
                            base: "data-[selected=true]:bg-primary-400 dark:data-[selected=true]:bg-primary-300 data-[hover=true]:bg-default-300/20 dark:data-[hover=true]:bg-default-200/40",
                            title: "group-data-[selected=true]:text-primary-foreground",
                        }}
                        items={sidebarItems}
                    />
                </ScrollShadow>

                <Dropdown placement="top">
                    <DropdownTrigger>
                        <Button
                            className="mb-4 h-14 items-center justify-between"
                            variant="light"
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
                                    description="Manage account"
                                    shortcut="⌘A"
                                    startContent={<LucideIcons.User className="text-lg text-default-500 flex-shrink-0" />}
                                    classNames={{
                                        base: "py-1",
                                        description: "text-tiny",
                                    }}
                                >
                                    Account
                                </DropdownItem>
                                <DropdownItem
                                    key="feedback"
                                    description="Improve product"
                                    shortcut="⌘F"
                                    startContent={<LucideIcons.MessageSquare className="text-lg text-default-500 flex-shrink-0" />}
                                    classNames={{
                                        base: "py-1",
                                        description: "text-tiny",
                                    }}
                                >
                                    Feedback
                                </DropdownItem>
                                <DropdownItem
                                    key="bug"
                                    description="Report issues"
                                    shortcut="⌘B"
                                    showDivider
                                    startContent={<LucideIcons.Bug className="text-lg text-default-500 flex-shrink-0" />}
                                    classNames={{
                                        base: "py-1",
                                        description: "text-tiny",
                                    }}
                                >
                                    Bug Report
                                </DropdownItem>
                                <DropdownItem
                                    key="logout"
                                    description="Sign out"
                                    shortcut="⌘L"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<LucideIcons.LogOut className={cn("text-lg flex-shrink-0", "text-danger")} />}
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

            <div className="w-full overflow-y-auto h-full p-6">{children}</div>
        </div>
    );
}
