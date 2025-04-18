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
import { signUpSchema, SignUpSchema } from '@/types/forms';
import {
    MailIcon,
    LockIcon,
    UserIcon,
    EyeIcon,
    EyeOffIcon,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerAction } from '@/actions/auth/register';
import { Spinner, Logo, GithubIcon, GoogleIcon } from '@/components/icons';

export function SignUpForm() {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [latestResult, setLatestResult] = useState<{ error?: string, success?: string } | null>(null);

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        register,
    } = useForm<SignUpSchema>({
        resolver: zodResolver(signUpSchema),
        mode: 'onChange'
    });

    const onSubmit = async (data: SignUpSchema) => {
        try {
            setIsLoading(true);
            setLatestResult(null);
            const result = await registerAction(data);
            setLatestResult(result);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key: keyof SignUpSchema) => (value: string) => {
        setValue(key, value, { shouldValidate: true });
    };

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="flex flex-col gap-2 items-center">
                <Logo />
                <p className="text-sm text-default-500">Join our community and start your journey</p>
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
                        {...register('username')}
                        placeholder="Choose a username"
                        onValueChange={handleChange('username')}
                        errorMessage={errors.username?.message}
                        isInvalid={!!errors.username}
                        startContent={<UserIcon className="text-default-400 w-4 h-4" />}
                        autoComplete="username"
                        classNames={{
                            input: "h-10",
                        }}
                        disabled={isLoading}
                    />

                    <Input
                        {...register('password')}
                        type={isVisible ? "text" : "password"}
                        placeholder="Create a password"
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

                    <Input
                        {...register('confirmPassword')}
                        type={isVisible ? "text" : "password"}
                        placeholder="Confirm your password"
                        onValueChange={handleChange('confirmPassword')}
                        errorMessage={errors.confirmPassword?.message}
                        isInvalid={!!errors.confirmPassword}
                        startContent={<LockIcon className="text-default-400 w-4 h-4" />}
                        autoComplete="new-password"
                        classNames={{
                            input: "h-10",
                        }}
                        disabled={isLoading}
                    />

                    <Checkbox defaultSelected size="sm" disabled={isLoading}>
                        <span className="text-sm">
                            I agree to the <Link href="#" size="sm">Terms of Service</Link> and <Link href="#" size="sm">Privacy Policy</Link>
                        </span>
                    </Checkbox>

                    <Button
                        type="submit"
                        color="primary"
                        className="w-full mt-2"
                        size="lg"
                        spinner={<Spinner size="5" />}
                        isLoading={isLoading || isSubmitting}
                    >
                        {isLoading || isSubmitting ? 'Creating Account...' : 'Sign Up'}
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
                        Already have an account?{' '}
                        <Link href="/sign-in" color="primary" className="font-medium">
                            Sign in
                        </Link>
                    </p>
                </form>
            </CardBody>
        </Card>
    );
}