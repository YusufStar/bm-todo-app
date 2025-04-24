"use server";

import { createCompanySchema, CreateCompanySchema, CompanyMemberRole } from "@/types/forms";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const MAX_COMPANIES_CREATED_PER_USER = 5;

export const createCompany = async (
  data: CreateCompanySchema,
  userId: string
): Promise<{ error?: string; success?: string; warning?: string }> => {
  const validatedFields = createCompanySchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, description, website, logo } = validatedFields.data;

  const allMyCompanies = await prisma.company.findMany({
    where: {
      ownerId: userId,
    },
  });

  if (allMyCompanies.length >= MAX_COMPANIES_CREATED_PER_USER) {
    return { error: "You have reached the maximum number of companies" };
  }

  const existingCompany = allMyCompanies.find((company) => company.name.toLowerCase() === name.toLowerCase());

  if (existingCompany) {
    return { warning: "Company name already claimed" };
  }

  await prisma.company.create({
    data: {
      name,
      description,
      website,
      logo,
      owner: {
        connect: {
          id: userId,
        },
      },
      members: {
        create: {
          userId,
          role: CompanyMemberRole.OWNER,
        },
      },
    },
  });

  revalidatePath("/setup");
  revalidatePath("/dashboard");
  return { success: "Company created successfully" };
};