'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Server action to get companies of the current user
 * @returns List of companies the user is a member of
 */
export async function getCompaniesAction({ userId }: { userId: string }) {
    try {
        if (!userId) {
            return { 
                success: false, 
                error: "Unauthorized access",
                companies: [] 
            }
        }

        const companies = await prisma.company.findMany({
            where: {
                members: { 
                    some: { 
                        userId: userId 
                    } 
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                avatar: true
                            }
                        }
                    }
                },
                owner: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        return { 
            success: true, 
            companies 
        }
    } catch (error) {
        console.error("Failed to fetch companies:", error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to fetch companies",
            companies: [] 
        }
    }
}

/**
 * Server action to select a company
 * Validates that the user is a member of the company
 * @returns The selected company if successful
 */
export async function selectCompanyAction({ userId, companyId }: { userId: string, companyId: string }) {
    
    if (!userId) {
        return {
            success: false,
            error: "Unauthorized access"
        }
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
            return {
                success: false,
                error: "Company not found or you are not a member"
            }
        }

        // Revalidate dashboard paths
        revalidatePath('/dashboard')
        
        return { 
            success: true, 
            company 
        }
    } catch (error) {
        console.error("Failed to select company:", error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to select company" 
        }
    }
} 