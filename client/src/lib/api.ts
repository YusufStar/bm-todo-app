import { z } from "zod";
import API from "./axios-client";
import { userUpdateSchema } from "@/validate";

type forgotPasswordType = { email: string };
type resetPasswordType = { password: string; verificationCode: string };

type LoginType = {
    email: string;
    password: string;
};

type registerType = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type verifyEmailType = { code: string };
type verifyMFAType = { code: string; secretKey: string };
type mfaLoginType = { code: string; email: string };

type SessionType = {
    _id: string;
    userId: string;
    userAgent: string;
    createdAt: string;
    expiresAt: string;
    isCurrent: boolean;
};

type SessionResponseType = {
    message: string;
    sessions: SessionType[];
};

export type mfaType = {
    message: string;
    secret: string;
    qrImageUrl: string;
};

export type changePasswordType = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export type userUpdateType = z.infer<typeof userUpdateSchema>;

export const loginMutationFn = async (data: LoginType) =>
    await API.post("/auth/login", data);

export const registerMutationFn = async (data: registerType) =>
    await API.post(`/auth/register`, data);

export const verifyEmailMutationFn = async (data: verifyEmailType) =>
    await API.post(`/auth/verify/email`, data);

export const forgotPasswordMutationFn = async (data: forgotPasswordType) =>
    await API.post(`/auth/password/forgot`, data);

export const resetPasswordMutationFn = async (data: resetPasswordType) =>
    await API.post(`/auth/password/reset`, data);

export const changePasswordMutationFn = async (data: changePasswordType) => {
    await API.post(`/auth/password/change`, data);
};

export const verifyMFALoginMutationFn = async (data: mfaLoginType) =>
    await API.post(`/mfa/verify-login`, data);

export const logoutMutationFn = async () => await API.post(`/auth/logout`);

export const mfaSetupQueryFn = async () => {
    const response = await API.get<mfaType>(`/mfa/setup`);
    return response.data;
};

export const verifyMFAMutationFn = async (data: verifyMFAType) =>
    await API.post(`/mfa/verify`, data);

export const revokeMFAMutationFn = async () => await API.put(`/mfa/revoke`, {});

export const getUserSessionQueryFn = async () => await API.get(`/session/`);

export const sessionsQueryFn = async () => {
    const response = await API.get<SessionResponseType>(`/session/all`);
    return response.data;
};

export const sessionDelMutationFn = async (id: string) =>
    await API.delete(`/session/${id}`);

export const getAllDepartmentsQueryFn = async (): Promise<{
    _id: string;
    name: string;
    description: string;
    updatedAt: string;
}[]> => {
    const response = await API.get(`/all-departments`);
    return response.data;
}

export const updateUserMutationFn = async (data: userUpdateType) => await API.put(`/user/update`, data)