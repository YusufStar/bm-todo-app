"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Input,
    Textarea,
    Button,
    Alert,
    addToast,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCompanySchema, CreateCompanySchema } from "@/types/forms";
import { BuildingIcon, GlobeIcon, ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createCompany } from "@/actions/company/create";

export default function CreateCompanyForm({
    userId,
}: {
    userId: string;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [latestResult, setLatestResult] = useState<{
        error?: string;
        success?: string;
        warning?: string;
        key: string;
    } | null>(null);

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        register,
    } = useForm<CreateCompanySchema>({
        resolver: zodResolver(createCompanySchema),
        mode: "onChange",
    });

    const onSubmit = async (data: CreateCompanySchema) => {
        try {
            setIsLoading(true);
            setLatestResult(null);
            const result = await createCompany(data, userId);
            setLatestResult({ ...result, key: crypto.randomUUID() });
            if (result.success) {
                router.replace("/dashboard");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (latestResult) {
            addToast({
                title: latestResult.success
                    ? "Success"
                    : latestResult.error
                        ? "Error"
                        : latestResult.warning
                            ? "Warning"
                            : "Info",
                description: latestResult.success
                    ? latestResult.success
                    : latestResult.error
                        ? latestResult.error
                        : latestResult.warning
                            ? latestResult.warning
                            : "",
                color: latestResult.success
                    ? "success"
                    : latestResult.error
                        ? "danger"
                        : latestResult.warning
                            ? "warning"
                            : "default",
                variant: "flat",
            });
        }
    }, [latestResult]);

    const handleChange = (key: keyof CreateCompanySchema) => (value: string) => {
        setValue(key, value, { shouldValidate: true });
    };

    return (
        <Card fullWidth>
            <CardHeader className="flex gap-3">
                <h1 className="text-xl font-bold">Create Company</h1>
            </CardHeader>
            <Divider />
            <CardBody>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <Input
                        {...register("name")}
                        placeholder="Enter company name"
                        onValueChange={handleChange("name")}
                        errorMessage={errors.name?.message}
                        isInvalid={!!errors.name}
                        startContent={<BuildingIcon className="text-default-400 w-4 h-4" />}
                        isRequired
                        classNames={{
                            input: "h-10",
                        }}
                        disabled={isLoading}
                    />

                    <Textarea
                        {...register("description")}
                        placeholder="Brief description of your company"
                        onValueChange={handleChange("description")}
                        errorMessage={errors.description?.message}
                        isInvalid={!!errors.description}
                        classNames={{
                            input: "min-h-[80px]",
                        }}
                        disabled={isLoading}
                    />

                    <Input
                        {...register("website")}
                        placeholder="https://yourcompany.com"
                        onValueChange={handleChange("website")}
                        errorMessage={errors.website?.message}
                        isInvalid={!!errors.website}
                        startContent={<GlobeIcon className="text-default-400 w-4 h-4" />}
                        classNames={{
                            input: "h-10",
                        }}
                        disabled={isLoading}
                    />

                    <Input
                        {...register("logo")}
                        placeholder="Enter logo URL"
                        onValueChange={handleChange("logo")}
                        errorMessage={errors.logo?.message}
                        isInvalid={!!errors.logo}
                        startContent={<ImageIcon className="text-default-400 w-4 h-4" />}
                        classNames={{
                            input: "h-10",
                        }}
                        disabled={isLoading}
                    />

                    <AnimatePresence mode="wait">
                        {latestResult && (
                            <motion.div
                                key={latestResult.key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Alert
                                    color={
                                        latestResult.error
                                            ? "danger"
                                            : latestResult.warning
                                                ? "warning"
                                                : "success"
                                    }
                                    variant="flat"
                                    className="text-sm"
                                >
                                    {latestResult.error
                                        ? latestResult.error
                                        : latestResult.warning
                                            ? latestResult.warning
                                            : latestResult.success}
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </CardBody>
            <Divider />
            <CardFooter className="flex justify-end gap-2">
                <Button
                    variant="flat"
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    color="primary"
                    onClick={handleSubmit(onSubmit)}
                    isLoading={isLoading || isSubmitting}
                >
                    {isLoading || isSubmitting ? "Creating..." : "Create Company"}
                </Button>
            </CardFooter>
        </Card>
    );
}
