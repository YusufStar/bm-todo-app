"use client";
import React, { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { Check, Copy, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/auth-provider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { mfaSetupQueryFn, mfaType, verifyMFAMutationFn } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { verifyMFASchema } from "@/validate";
import RevokeMfa from "./_RevokeMfa";

function MfaSetup() {
  const { user, refetch } = useAuthContext();
  const [showKey, setShowKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["mfa-setup"],
    queryFn: mfaSetupQueryFn,
    enabled: isOpen,
    staleTime: Infinity,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: verifyMFAMutationFn,
  });

  const mfaData = data ?? ({} as mfaType);

  const form = useForm<z.infer<typeof verifyMFASchema>>({
    resolver: zodResolver(verifyMFASchema),
    defaultValues: {
      pin: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
      setShowKey(false);
      setCopied(false);
    }
  }, [isOpen]);

  function onSubmit(values: z.infer<typeof verifyMFASchema>) {
    const data = {
      code: values.pin,
      secretKey: mfaData.secret,
    };
    mutate(data, {
      onSuccess: (response: any) => {
        refetch();
        setIsOpen(false);
        toast.success(response.message)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    });
  }

  const onCopy = useCallback((value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3">
        <h3 className="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
          Multi-Factor Authentication (MFA)
        </h3>
        {user?.userPreferences?.enable2FA && (
          <span
            className="select-none whitespace-nowrap font-medium bg-green-100 text-green-500
          text-xs h-6 px-2 rounded flex flex-row items-center justify-center gap-1"
          >
            Enabled
          </span>
        )}
      </div>

      <p className="mb-6 text-sm dark:text-gray-100 font-normal">
        Protect your account by adding an extra layer of security.
      </p>
      {user?.userPreferences?.enable2FA ? (
        <RevokeMfa />
      ) : (
        <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              Enable MFA
            </Button>
          </DialogTrigger>
          <DialogContent className="!gap-0">
            <DialogHeader>
              <DialogTitle className="text-[17px] text-slate-12 font-semibold">
                Setup Multi-Factor Authentication
              </DialogTitle>
            </DialogHeader>
            <div className="">
              <p className="mt-6 text-sm dark:text-inherit font-bold">
                Scan the QR code
              </p>
              <span className="text-sm dark:text-inherit font-normal">
                Use an app like{" "}
                <a
                  className="!text-primary underline decoration-primary decoration-1 underline-offset-2 transition duration-200 ease-in-out hover:decoration-blue-11 dark:text-current dark:decoration-slate-9 dark:hover:decoration-current "
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://support.1password.com/one-time-passwords/"
                >
                  1Password
                </a>{" "}
                or{" "}
                <a
                  className="!text-primary underline decoration-primary decoration-1 underline-offset-2 transition duration-200 ease-in-out hover:decoration-blue-11 dark:text-current dark:decoration-slate-9 dark:hover:decoration-current "
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://safety.google/authentication/"
                >
                  Google Authenticator
                </a>{" "}
                to scan the QR code below.
              </span>
            </div>
            <div className="mt-4 flex flex-row items-center gap-4">
              <div className=" shrink-0 rounded-md border p-2  border-border">
                {isLoading || !mfaData?.qrImageUrl ? (
                  <Skeleton className="w-[160px] h-[160px]" />
                ) : (
                  <img
                    alt="QR code"
                    decoding="async"
                    src={mfaData.qrImageUrl}
                    width="160"
                    height="160"
                    className="rounded-md"
                  />
                )}
              </div>

              {showKey ? (
                <div className="w-full">
                  <div
                    className="flex items-center gap-1
                              text-sm font-normal"
                  >
                    <span>Copy setup key</span>
                    <button
                      disabled={copied}
                      onClick={() => onCopy(mfaData?.qrImageUrl)}
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm block truncate w-[200px]">
                    {mfaData?.secret}
                  </p>
                </div>
              ) : (
                <span className="text-sm font-normal">
                  Can't scan the code?
                  <button
                    className="block transition duration-200 ease-in-out hover:underline"
                    type="button"
                    onClick={() => setShowKey(true)}
                  >
                    View the Setup Key
                  </button>
                </span>
              )}
            </div>

            <div className="mt-8 border-t">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full mt-6 flex flex-col gap-4 "
                >
                  <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm mb-1 text-slate-11 font-bold">
                          Then enter the code
                        </FormLabel>
                        <FormControl>
                          <InputOTP
                            className="!text-lg flex items-center"
                            maxLength={6}
                            pattern={REGEXP_ONLY_DIGITS}
                            {...field}
                            style={{ justifyContent: "center" }}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot
                                index={0}
                                className="!w-14 !h-12 !text-lg"
                              />
                              <InputOTPSlot
                                index={1}
                                className="!w-14 !h-12 !text-lg"
                              />
                            </InputOTPGroup>
                            <InputOTPGroup>
                              <InputOTPSlot
                                index={2}
                                className="!w-14 !h-12 !text-lg"
                              />
                              <InputOTPSlot
                                index={3}
                                className="!w-14 !h-12 !text-lg"
                              />
                            </InputOTPGroup>
                            <InputOTPGroup>
                              <InputOTPSlot
                                index={4}
                                className="!w-14 !h-12 !text-lg"
                              />
                              <InputOTPSlot
                                index={5}
                                className="!w-14 !h-12 !text-lg"
                              />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button disabled={isPending} className="w-full">
                    {isPending && <Loader className="animate-spin" />}
                    Verify
                  </Button>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default MfaSetup