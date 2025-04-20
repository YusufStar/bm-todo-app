"use server";

import { getCompanies } from "./get";

export async function validateCompany(userId: string, currentCompanyId: string | null) {
    const companies = await getCompanies(userId);

    if (companies.length === 0) {
      return { error: "No companies found", companyId: null };
    }

    // If there's a currentCompanyId, check if it exists in user's companies
    if (currentCompanyId) {
      const company = companies.find((company) => company.id === currentCompanyId);
      if (company) {
        return { companyId: company.id };
      }
    }

    // If currentCompanyId is invalid or null, return the first company
    return { companyId: companies[0].id };
} 