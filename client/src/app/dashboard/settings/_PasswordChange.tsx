"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { changePasswordMutationFn } from "@/lib/api";
import { changePasswordSchema } from "@/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function PasswordChange() {
    const router = useRouter()
    const { mutate, isPending } = useMutation({
        mutationFn: changePasswordMutationFn,
    })

    const form = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const onSubmit = (values: z.infer<typeof changePasswordSchema>) => {
        mutate(values, {
            onSuccess() {
                toast.success("Password changed successfully")
                router.refresh()
                form.reset()
            },
            onError(error) {
                toast.error(error.message)
            }
        })
    }

    return <div className="w-full">
        <h3 className="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
            Change Password
        </h3>
        <p className="mb-6 text-sm font-normal">
            Change your password to keep your account secure. Make sure to use a strong password that you haven't used before.
        </p>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                    <div className="grid gap-6">
                        <div className="grid gap-3">
                            <FormField
                                control={form.control}
                                name="currentPassword"
                                disabled={isPending}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Current Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input autoComplete="off" readOnly onFocus={(e) => {
                                                e.currentTarget.removeAttribute("readonly")
                                                e.currentTarget.focus()
                                            }} placeholder="********" type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-3">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                disabled={isPending}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            New Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input autoComplete="new-password" placeholder="********" type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-3">
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                disabled={isPending}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Confirm Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input autoComplete="new-password" placeholder="********" type="password" {...field} />
                                        </FormControl>
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
                            Change Password
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    </div>
}