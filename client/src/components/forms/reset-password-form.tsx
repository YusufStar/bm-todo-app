"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { resetPasswordSchema } from "@/validate"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Loader } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { resetPasswordMutationFn } from "@/lib/api"
import { toast } from "sonner"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const exp = Number(params.get("exp"));
  const now = Date.now();

  const isValid = code && exp && exp > now

  const { mutate, isPending } = useMutation({
    mutationFn: resetPasswordMutationFn,
  });

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
    if (!code) {
      router.push("/forgot-password?email=");
      return
    }

    const data = {
      password: values.password,
      verificationCode: code,
    }

    mutate(data, {
      onSuccess() {
        toast.success("Password updated successfully")
        router.replace("/signin")
      },
      onError(error) {
        toast.error(error.message)
      },
    })
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Set up a new password
          </CardTitle>
          <CardDescription>
            Your password must be diffrferent from your previous one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {
            isValid ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-4">
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <FormField
                          control={form.control}
                          name="password"
                          disabled={isPending}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Password
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="********" type="password" {...field} />
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
                                <Input placeholder="********" type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full"
                      >
                        {isPending && <Loader className="animate-spin" />}
                        Update Password
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="text-center flex flex-col gap-4">
                <p className="text-red-500">Invalid or expired link</p>
                <Link href="/forgot-password?email=">
                  <Button className="w-full mt-4">
                    Back to forgot password
                  </Button>
                </Link>
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>
  )
}
