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
import { registerSchema } from "@/validate"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { ArrowRight, Loader, MailCheckIcon } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { registerMutationFn } from "@/lib/api"
import { toast } from "sonner"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {mutate, isPending} = useMutation({
    mutationFn: registerMutationFn,
  })

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    mutate(values, {
      onSuccess() {
        setIsSubmitted(true)
      },
      onError(error) {
        toast.error(error.message)
      }
    })
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
              isSubmitted ? "Check your email" : "Create an account"
            }
          </CardTitle>
          <CardDescription>
            {
              isSubmitted ? `We just sent a verification link to ${form.getValues().email}.` : "Sign up to get started"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                  <div className="grid gap-6">
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
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                      Sign Up
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/signin" className="underline underline-offset-4">
                      Sign In
                    </Link>
                  </div>
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
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
    </div>
  )
}
