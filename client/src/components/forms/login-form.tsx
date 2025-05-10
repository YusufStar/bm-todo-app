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
import { loginSchema } from "@/validate"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Loader } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { loginMutationFn } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  })

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    mutate(values, {
      onSuccess: (response) => {
        if (response.data.mfaRequired) {
          router.replace(`/verify-mfa?email=${values.email}`)
          return
        }

        router.replace("/dashboard")
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-md", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
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
                  <span className="w-full text-center gap-2 flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Forgot your password?{" "}
                    </span>
                    <Link
                      href={`/forgot-password?email=${form.getValues().email}`}
                      className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </span>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full"
                  >
                    {isPending && <Loader className="animate-spin" />}
                    Sign In
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
