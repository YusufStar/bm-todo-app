"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { LucideIconNames, LucideIcons } from "@/lib/icon-lib"
import { CreateTeamSchema, TeamStatus } from "@/validate"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronDown, Loader, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { DynamicLucideIcon } from "../icon"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { TeamStatusBadge } from "@/lib/badges"
import { useMutation } from "@tanstack/react-query"
import { createTeamMutationFn } from "@/lib/api"
import { toast } from "sonner"
import { useTeamContext } from "@/context/team-provider"

interface CreateTeamModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateTeamModal({ open: externalOpen, onOpenChange, onSuccess }: CreateTeamModalProps = {}) {
    const { refetch } = useTeamContext()
    const [internalOpen, setInternalOpen] = useState(false)
    
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    const { isPending, mutate } = useMutation({
        mutationFn: createTeamMutationFn,
    })

    const form = useForm<z.infer<typeof CreateTeamSchema>>({
        resolver: zodResolver(CreateTeamSchema),
        defaultValues: {
            name: "",
            logo: "Grid",
            status: TeamStatus.ACTIVE,
            members: []
        },
    })

    const onSubmit = (values: z.infer<typeof CreateTeamSchema>) => {
        mutate(values, {
            onSuccess: () => {
                toast.success("Team created successfully")
                refetch()
                setOpen(false)
                form.reset()
                if (onSuccess) onSuccess()
            },
            onError: (error) => {
                toast.error("Error creating team")
                console.error(error)
            },
        });
    }

    useEffect(() => {
        if (open) {
            form.reset({
                name: "",
                logo: "Grid",
                status: TeamStatus.ACTIVE,
                members: []
            })
        }
    }, [open, form])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create a new team
                    </DialogTitle>
                    <DialogDescription>
                        Create a new team to start collaborating with your team members.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4">
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        disabled={isPending}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Team name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Team name"
                                                        disabled={isPending}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="logo"
                                        render={({ field }) => {
                                            const [search, setSearch] = useState("")
                                            const filteredIcons = LucideIconNames.filter(icon =>
                                                icon.toLowerCase().includes(search.toLowerCase())
                                            )

                                            return (
                                                <FormItem>
                                                    <FormLabel>Team logo</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    className="w-full justify-between"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <DynamicLucideIcon name={field.value as keyof typeof LucideIcons} className="size-4" />
                                                                        {field.value}
                                                                    </div>
                                                                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-full p-0">
                                                            <Command>
                                                                <CommandInput
                                                                    placeholder="Search icon..."
                                                                    onValueChange={setSearch}
                                                                />
                                                                <CommandList>
                                                                    {filteredIcons.map((icon) => (
                                                                        <CommandItem
                                                                            key={icon}
                                                                            onSelect={() => field.onChange(icon)}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <DynamicLucideIcon name={icon} className="size-4" />
                                                                                {icon}
                                                                                {field.value === icon && (
                                                                                    <Check className="ml-auto h-4 w-4 text-primary" />
                                                                                )}
                                                                            </div>
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )
                                        }}
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Team status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.entries(TeamStatus).map(([key, value]) => (
                                                            <SelectItem key={key} value={value}>
                                                                <div className="flex items-center gap-2">
                                                                    <TeamStatusBadge status={value} />
                                                                    {value}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                    </form>
                </Form>

                <DialogFooter>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isPending}
                        className="w-full"
                    >
                        {isPending && <Loader className="animate-spin" />}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}