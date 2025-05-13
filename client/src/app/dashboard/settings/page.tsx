import { Separator } from "@/components/ui/separator";
import PasswordChange from "./_PasswordChange";
import MfaSetup from "./_MfaSetup";
import SessionSettings from "./_SessionSettings";
import AccountInformationUpdate from "./_AccountInformationUpdate";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-4 flex-1">
            <AccountInformationUpdate />
            <Separator className="my-4" />
            <PasswordChange />
            <Separator className="my-4" />
            <MfaSetup />
            <Separator className="my-4" />
            <SessionSettings />
        </div>
    )
}