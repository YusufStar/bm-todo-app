'use client';

import React, { useState } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    Button,
    Link,
    Divider,
    Checkbox,
    Alert,
} from '@heroui/react';
import { signInSchema, SignInSchema } from '@/types/forms';
import {
    MailIcon,
    LockIcon,
    UserIcon,
    EyeIcon,
    EyeOffIcon,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInAction } from '@/actions/auth/login';
import { Spinner, Logo, GithubIcon, GoogleIcon } from '@/components/icons';

export function SignInForm() {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [latestResult, setLatestResult] = useState<{ error?: string, success?: string } | null>(null);

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        register,
    } = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
        mode: 'onChange'
    });

    const onSubmit = async (data: SignInSchema) => {
        try {
            setIsLoading(true);
            setLatestResult(null);
            const result = await signInAction(data);
            setLatestResult(result);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key: keyof SignInSchema) => (value: string) => {
        setValue(key, value, { shouldValidate: true });
    };

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="flex flex-col gap-2 items-center">
                <Logo />
                <p className="text-sm text-default-500">Welcome back! Please sign in to continue</p>
            </CardHeader>

            <CardBody>
                <div className="flex gap-2 mb-6">
                    <Button
                        startContent={<GithubIcon fill="currentColor" size={20} />}
                        variant="flat"
                        className="flex-1"
                    >
                        GitHub
                    </Button>
                    <Button
                        startContent={<GoogleIcon fill="currentColor" size={20} />}
                        variant="flat"
                        className="flex-1"
                    >
                        Google
                    </Button>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <Divider className="flex-1" />
                    <span className="text-sm text-default-500">OR</span>
                    <Divider className="flex-1" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <Input
                        {...register('email')}
                        placeholder="Enter your email"
                        onValueChange={handleChange('email')}
                        errorMessage={errors.email?.message}
                        isInvalid={!!errors.email}
                        startContent={<MailIcon className="text-default-400 w-4 h-4" />}
                        autoComplete="email"
                        classNames={{
                            input: "h-10",
                        }}
                        disabled={isLoading}
                    />

                    <Input
                        {...register('password')}
                        type={isVisible ? "text" : "password"}
                        placeholder="Enter your password"
                        onValueChange={handleChange('password')}
                        errorMessage={errors.password?.message}
                        isInvalid={!!errors.password}
                        startContent={<LockIcon className="text-default-400 w-4 h-4" />}
                        endContent={
                            <button type="button" onClick={toggleVisibility} className="focus:outline-none">
                                {isVisible ? (
                                    <EyeOffIcon className="text-default-400 w-4 h-4" />
                                ) : (
                                    <EyeIcon className="text-default-400 w-4 h-4" />
                                )}
                            </button>
                        }
                        autoComplete="new-password"
                        classNames={{
                            input: "h-10",
                        }}
                        disabled={isLoading}
                    />

                    <Button
                        type="submit"
                        color="primary"
                        className="w-full mt-2"
                        size="lg"
                        spinner={<Spinner size="5" />}
                        isLoading={isLoading || isSubmitting}
                    >
                        {isLoading || isSubmitting ? 'Signing In...' : 'Sign In'}
                    </Button>

                    {latestResult && (
                        <Alert
                            color={latestResult.error ? 'danger' : 'success'}
                            variant="flat"
                        >
                            {latestResult.error ? latestResult.error : latestResult.success}
                        </Alert>
                    )}

                    <p className="text-center text-sm text-default-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/sign-up" color="primary" className="font-medium">
                            Sign up
                        </Link>
                    </p>
                </form>
            </CardBody>
        </Card>
    );
}