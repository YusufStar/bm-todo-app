"use server";

import { createCompanySchema, CreateCompanySchema } from "@/types/forms";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const createCompany = async (
  data: CreateCompanySchema,
  userId: string
): Promise<{ error?: string; success?: string; warning?: string }> => {
  const validatedFields = createCompanySchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, description, website, logo } = validatedFields.data;

  const existingCompany = await prisma.company.findFirst({
    where: {
      ownerId: userId,
      name: name,
    },
  });

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
        },
      },
    },
  });

  revalidatePath("/setup");
  revalidatePath("/dashboard");
  return { success: "Company created successfully" };
};