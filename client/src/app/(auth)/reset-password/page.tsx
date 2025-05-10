import { ResetPasswordForm } from "@/components/forms/reset-password-form"
import Logo from "@/components/logo"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Logo svgclassname="w-6 h-6 text-primary" />
      
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}