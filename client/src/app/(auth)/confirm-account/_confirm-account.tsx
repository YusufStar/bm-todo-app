"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyEmailMutationFn } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Loader, Verified } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function ConfirmAccount() {
    const router = useRouter();

    const params = useSearchParams();
    const code = params.get("code");

    const { mutate, isPending } = useMutation({
        mutationFn: verifyEmailMutationFn,
    });

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (!code) {
            toast.error("Confirmation code is missing");
            return;
        }
        mutate(
            { code },

            {
                onSuccess: () => {
                    toast.success("Account confirmed successfully");
                    router.replace("/");
                },
                onError: (error) => {
                    toast.error(error.message ?? "An error occurred");
                },
            }
        );
    };

    return (
        <div className={cn("flex flex-col gap-6 w-full max-w-md")}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">
                        Confirm your account
                    </CardTitle>
                    <CardDescription>
                        Please confirm your account by clicking the button below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Button
                            disabled={isPending}
                            type="submit"
                            className="w-full"
                            variant="outline"
                        >
                            {isPending ? <Loader className="animate-spin" /> : <Verified className="mr-2" />}
                            Confirm account
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <span className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                If you have any issues, please contact support at{" "}<a href="mailto:me@yusufstar.com" className="text-cyan-500">me@yusufstar.com</a>
            </span>
        </div>
    );
}