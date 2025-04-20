"use client";

import { Card, CardBody, Tab, Tabs } from "@heroui/react";
import CreateCompanyForm from "./CreateCompanyForm";
import InvitationsForm from "./InvitationsForm";
import { User } from "@prisma/client";

export default function SetupPageContent({
    user,
}: {
    user: User;
}) {
    return (
      <Card className="w-full max-w-2xl">
        <CardBody>
          <Tabs aria-label="Setup" fullWidth>
            <Tab key="create-company" title="Create Company">
              <CreateCompanyForm userId={user.id} />
            </Tab>
            <Tab key="invitations" title="Invitations">
              <InvitationsForm />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    );
}