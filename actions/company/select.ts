'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

/**
 * Server action to select a company
 * Validates that the user is a member of the company
 * @returns The selected company if successful
 */
export async function selectCompanyAction(companyId: string) {
    const session = await auth()
    const userId = session?.user?.id
    
    if (!userId) {
        throw new Error("Unauthorized access")
    }

    try {
        // Validate that the user is a member of the company
        const company = await prisma.company.findUnique({
            where: {
                id: companyId,
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                members: true,
                owner: true
            }
        })

        if (!company) {
            throw new Error("Company not found or you are not a member")
        }

        // Revalidate dashboard paths
        revalidatePath('/dashboard')
        
        return { success: true, company }
    } catch (error) {
        console.error("Failed to select company:", error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to select company" 
        }
    }
} 