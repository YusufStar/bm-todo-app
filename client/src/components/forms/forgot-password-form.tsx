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
import { ArrowRight, Loader, MailCheckIcon } from "lucide-react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { forgotPasswordMutationFn } from "@/lib/api"
import { toast } from "sonner"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const params = useSearchParams();

  const email = params.get("email");

  const [isSubmitted, setIsSubmitted] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPasswordMutationFn,
  });

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email || "",
    },
  })

  const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
    mutate(values, {
      onSuccess: () => {
        setIsSubmitted(true);
      },
      onError: (error) => {
        toast.error(error.message)
      },
    });
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {
              isSubmitted && <MailCheckIcon className="inline-block mr-2" />
            }
            {
              isSubmitted ? "Check your email" : "Forgot password?"
            }
          </CardTitle>
          <CardDescription>
            {
              isSubmitted ? `We just sent a password reset link to ${form.getValues().email}.` : "Enter your account email to reset your password."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="email"
                        disabled={isPending}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="example@gmail.com" {...field} />
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
                      Send Reset Intructions
                    </Button>
                  </div>
                  <Link href="/signin" className="w-full">
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={isPending}
                    >
                      Back to login
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          ) : (
            <Link href="/signin">
              <Button className="w-full">
                Go to login
                <ArrowRight />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
