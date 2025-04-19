import { prisma } from "@/lib/prisma"

export const getCompany = async (companyId: string, userId: string) => {
    const company = await prisma.company.findUnique({
        where: {
            id: companyId
        },
        include: {
            members: true
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

export const getCompanyMembers = async (companyId: string, userId: string) => {
    const members = await prisma.companyMember.findMany({
        where: {
            companyId: companyId
        }
    })

    if (!members) {
        return []
    }

    const isMember = members.some((member) => member.userId === userId)

    if (!isMember) {
        throw new Error("You are not a member of this company")
    }

    return members
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
    const companies = await prisma.company.findMany({
        where: {
            members: { some: { userId: userId } }
        }
    })

    if (!companies) {
        return []
    }

    return companies
}