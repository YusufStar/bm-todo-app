import { prisma } from "@/lib/prisma"

export const getCompany = async (companyId: string, userId: string) => {
    if (!userId) {
        throw new Error("You are not authenticated")
    }

    const company = await prisma.company.findUnique({
        where: {
            id: companyId
        },
        include: {
            members: true,
            owner: true
        }
    })

    if (!company) {
        return null
    }

    const isMember = company.members.some((member) => member.userId === userId)

    if (!isMember) {
        throw new Error("You are not a member of this company")
    }

    return company
}

export const getMyCompanyInvitations = async (email: string) => {
    const invitations = await prisma.companyInvitation.findMany({
        where: {
            invitedEmail: email
        }
    })

    if (!invitations) {
        return []
    }

    return invitations
}

export const getCompanies = async (userId: string) => {
    if (!userId) {
        throw new Error("You are not authenticated")
    }
    
    const companies = await prisma.company.findMany({
        where: {
            members: { some: { userId: userId } }
        },
        include: {
            members: true,
            owner: true
        }
    })

    if (!companies) {
        return []
    }

    return companies
}