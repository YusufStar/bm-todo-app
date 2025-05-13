"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthContext } from "@/context/auth-provider";
import { getAllDepartmentsQueryFn, updateUserMutationFn } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { userUpdateSchema } from "@/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function AccountInformationUpdate() {
    const router = useRouter()
    const { user, refetch, isLoading: isLoadingUser } = useAuthContext()
    const { isLoading, data } = useQuery({
        queryKey: ["departments"],
        queryFn: getAllDepartmentsQueryFn
    })

    const form = useForm<z.infer<typeof userUpdateSchema>>({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            avatar: "",
            department: "",
            name: "",
        },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: updateUserMutationFn,
    })

    const onSubmit = (values: z.infer<typeof userUpdateSchema>) => {
        mutate(values, {
            onSuccess() {
                toast.success("User updated successfully")
                refetch()
            },
            onError(error) {
                toast.error(error.message)
            }
        })
    }

    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                form.reset({
                    avatar: user.avatar ?? "",
                    department: user.department._id,
                    name: user.name ?? "",
                });
            }, 25);

            return () => clearTimeout(timer);
        }
    }, [user])


    useEffect(() => {
        const subscription = form.watch((value) => {
            console.log("DEPARTMENT CHANGED:", value.department)
        })
        return () => subscription.unsubscribe()
    }, [form])

    if (isLoading || isLoadingUser) {
        return <div className="w-full flex justify-center items-center py-4">
            <Loader className="animate-spin" />
        </div>
    }

    if (!user) {
        return <div className="w-full flex justify-center items-center py-4">
            <p className="text-sm text-slate-11">No user found</p>
        </div>
    }

    return <div className="w-full">
        <h3 className="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
            Account Informations
        </h3>
        <p className="mb-6 text-sm font-normal">
            Update your account information to keep your account secure. Make sure to use a strong password that you haven't used before.
        </p>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Avatar className="w-16 h-16">
                            <AvatarImage
                                src={form.watch("avatar") || user?.avatar}
                                alt="Avatar"
                            />
                            <AvatarFallback>
                                {getInitials(user?.name || "")}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="grid gap-3">

                        <FormField
                            control={form.control}
                            name="name"
                            disabled={isPending}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            className="w-full max-w-sm"
                                            placeholder="Name"
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
                            name="department"
                            disabled={isPending}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <Select
                                        disabled={isPending}
                                        onValueChange={field.onChange}
                                        value={field.value || ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full max-w-sm">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {data?.map((department) => (
                                                <SelectItem
                                                    key={department._id}
                                                    value={department._id}
                                                >
                                                    {department.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-fit"
                    >
                        {isPending && <Loader className="animate-spin" />}
                        Update Account
                    </Button>
                </div>
            </form>
        </Form>
    </div>
}