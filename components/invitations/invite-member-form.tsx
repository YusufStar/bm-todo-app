"use client";

import { useState } from "react";
import { Button, Input } from "@heroui/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";

// Define the form schema
const inviteMemberFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

type InviteMemberFormData = z.infer<typeof inviteMemberFormSchema>;

interface InviteMemberFormProps {
  onSubmit: (data: InviteMemberFormData) => void;
  isSubmitting?: boolean;
}

export function InviteMemberForm({ onSubmit, isSubmitting = false }: InviteMemberFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberFormSchema),
    defaultValues: {
      email: ""
    }
  });

  const handleFormSubmit = (data: InviteMemberFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          label="Email Address"
          placeholder="Enter email address"
          type="email"
          variant="bordered"
          startContent={<Mail className="text-default-400" size={16} />}
          isInvalid={!!errors.email}
          errorMessage={errors.email?.message}
          {...register("email")}
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="submit"
          color="primary"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        >
          Send Invitation
        </Button>
      </div>
    </form>
  );
} 