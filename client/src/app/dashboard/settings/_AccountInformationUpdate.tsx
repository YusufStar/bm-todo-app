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

export default function AccountInformationUpdate() {
    const form = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const onSubmit = (values: z.infer<typeof changePasswordSchema>) => {

    }

    return <div className="w-full">
        <h3 className="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
            Account Informations
        </h3>
        <p className="mb-6 text-sm font-normal">
            Update your account information to keep your account secure. Make sure to use a strong password that you haven't used before.
        </p>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>

            </form>
        </Form>
    </div>
}