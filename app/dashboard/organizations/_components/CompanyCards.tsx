"use client";

import DashboardPageLayout from "@/components/layout/dashboard-page-layout";
import { Company } from "@/types/company";
import { memo, useCallback, useMemo, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Avatar, AvatarGroup, Button, Divider, Chip, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Select, SelectItem } from "@heroui/react";
import { Users, Calendar, Building, ChevronRight, Search, ChevronDown, Filter, SortAsc, SortDesc } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type SortField = "name" | "createdAt" | "members";
type SortDirection = "asc" | "desc";
type FilterType = "all" | "owner" | "member";

export default function OrganizationsCards({ companies, userId }: { companies: Company[], userId: string }) {
    const [searchValue, setSearchValue] = useState("");
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [filterType, setFilterType] = useState<FilterType>("all");

    // Filter and sort companies
    const filteredCompanies = useMemo(() => {
        let filtered = [...companies];

        // Apply search filter
        if (searchValue.trim()) {
            filtered = filtered.filter(company =>
                company.name.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        // Apply type filter
        if (filterType === "owner") {
            filtered = filtered.filter(company => company.ownerId === userId);
        } else if (filterType === "member") {
            filtered = filtered.filter(company => company.ownerId !== userId);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            if (sortField === "name") {
                return sortDirection === "asc"
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (sortField === "createdAt") {
                return sortDirection === "asc"
                    ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else { // members
                return sortDirection === "asc"
                    ? a.members.length - b.members.length
                    : b.members.length - a.members.length;
            }
        });

        return filtered;
    }, [companies, searchValue, sortField, sortDirection, filterType]);

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
    };

    const handleSortChange = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleFilterChange = (type: FilterType) => {
        setFilterType(type);
    };

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4 mb-5">
                <div className="flex flex-col sm:flex-row justify-between gap-3 items-end">
                    <Input
                        isClearable
                        classNames={{
                            base: "w-full sm:max-w-[50%]",
                            inputWrapper: "border-1",
                        }}
                        placeholder="Search organizations..."
                        size="sm"
                        startContent={<Search className="text-default-300" size={18} />}
                        value={searchValue}
                        variant="bordered"
                        onClear={() => handleSearchChange("")}
                        onValueChange={handleSearchChange}
                    />
                    <div className="flex gap-3">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    endContent={<ChevronDown className="text-small" size={16} />}
                                    size="sm"
                                    variant="flat"
                                    startContent={<Filter size={16} />}
                                >
                                    Filter
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Filter Options"
                                closeOnSelect={true}
                                selectedKeys={[filterType]}
                                selectionMode="single"
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as FilterType;
                                    handleFilterChange(selected);
                                }}
                            >
                                <DropdownItem key="all">All Organizations</DropdownItem>
                                <DropdownItem key="owner">Owned by me</DropdownItem>
                                <DropdownItem key="member">Member only</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>

                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    endContent={<ChevronDown className="text-small" size={16} />}
                                    size="sm"
                                    variant="flat"
                                    startContent={sortDirection === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
                                >
                                    Sort by
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Sort Options"
                                closeOnSelect={true}
                                selectedKeys={[sortField]}
                                selectionMode="single"
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as SortField;
                                    handleSortChange(selected);
                                }}
                            >
                                <DropdownItem key="name">Name</DropdownItem>
                                <DropdownItem key="createdAt">Creation Date</DropdownItem>
                                <DropdownItem key="members">Members Count</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-500 text-small">
                        {filteredCompanies.length} organization{filteredCompanies.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        );
    }, [searchValue, filterType, sortField, sortDirection, filteredCompanies.length]);

    if (companies.length === 0) {
        return (
            <DashboardPageLayout
                title="Organizations"
                subtitle="Manage your organizations"
            >
                <Card className="flex flex-col items-center justify-center h-[60vh] p-8">
                    <Building className="w-16 h-16 text-default-300 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Organizations Found</h2>
                    <p className="text-default-500 mb-6 text-center max-w-md">
                        It seems you are not a member of any organization yet. Create or join an organization to collaborate with your team.
                    </p>
                    <Button color="primary">Create Organization</Button>
                </Card>
            </DashboardPageLayout>
        );
    }

    return (
        <DashboardPageLayout
            title="Organizations"
            subtitle="Manage your organizations"
        >
            {topContent}

            {filteredCompanies.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-8 my-5">
                    <Filter className="w-12 h-12 text-default-300 mb-3" />
                    <h3 className="text-lg font-semibold mb-2">No Matching Organizations</h3>
                    <p className="text-default-500 text-center max-w-md mb-4">
                        We couldn&apos;t find any organizations matching your current filters.
                    </p>
                    <Button
                        variant="flat"
                        color="primary"
                        onPress={() => {
                            setSearchValue("");
                            setFilterType("all");
                        }}
                    >
                        Clear Filters
                    </Button>
                </Card>
            ) : (
                <div className="flex flex-col gap-5 w-full">
                    {filteredCompanies.map((company) => (
                        <CompanyCard key={company.id} company={company} />
                    ))}
                </div>
            )}
        </DashboardPageLayout>
    );
}

const CompanyCard = memo(({ company }: { company: Company }) => {
    const createdDate = formatDistanceToNow(new Date(company.createdAt), { addSuffix: true });

    return (
        <Card 
            isHoverable 
            className="w-full hover:border-primary-200 transition-all duration-300"
            shadow="sm"
        >
            <CardBody className="p-0 overflow-hidden">
                <div className="px-4 py-3">
                    {/* Company Info Section */}
                    <div className="flex items-center pb-4 border-b border-divider">
                        <Avatar
                            isBordered
                            src={company.logo || undefined}
                            alt={company.name}
                            name={company.name}
                            color="primary"
                            size="lg"
                        />
                        <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between w-full">
                                <h3 className="text-lg font-bold">{company.name}</h3>
                                <Chip
                                    color="primary"
                                    variant="flat"
                                    size="sm"
                                    startContent={<Users size={12} />}
                                >
                                    {company.members.length}
                                </Chip>
                            </div>
                            <div className="flex items-center text-default-500 text-xs mt-0.5">
                                <Calendar size={12} className="mr-1" />
                                <span>{createdDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Owner & Team Row */}
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                            <Avatar
                                src={company.owner.avatar || undefined}
                                name={company.owner.username}
                                size="sm"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{company.owner.username}</span>
                                <span className="text-xs text-default-500">Owner</span>
                            </div>
                        </div>

                        <Chip
                            size="sm"
                            variant="dot"
                            color={company.owner.id === company.members[0]?.userId ? "success" : "primary"}
                        >
                            {company.owner.id === company.members[0]?.userId ? "Active" : "Member"}
                        </Chip>
                    </div>

                    {/* Team Members */}
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-default-600">Team Members</span>
                            <span className="text-xs text-default-400">{company.id}</span>
                        </div>
                        
                        <AvatarGroup
                            size="sm"
                            max={6}
                            total={company.members.length}
                            renderCount={(count) => (
                                <Avatar 
                                    className="bg-default-100 text-default-600 text-xs"
                                    size="sm"
                                >
                                    +{count}
                                </Avatar>
                            )}
                        >
                            {company.members.map((member) => (
                                <Avatar
                                    key={member.id}
                                    src={member.user.avatar || undefined}
                                    name={member.user.username}
                                    title={member.user.username}
                                    size="sm"
                                    className="border-1 border-background"
                                />
                            ))}
                        </AvatarGroup>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
});

CompanyCard.displayName = "CompanyCard";