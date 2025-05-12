import { Separator } from "@/components/ui/separator"
import MfaSetup from "./_MfaSetup"
import SessionSettings from "./_SessionSettings"

function SecurityPage() {
  return <div className="flex flex-col gap-4 flex-1">
    {/* Header */}
    <span className="text-2xl tracking-[-0.16px] font-bold mb-1">
      Account Security
    </span>

    <Separator />
    
    <MfaSetup />
    <Separator className="my-4" />
    <SessionSettings />
  </div>
}

export default SecurityPage