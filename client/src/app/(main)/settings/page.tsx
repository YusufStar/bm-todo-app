import React from 'react'
import SessionSettings from './_SessionSettings'
import MfaSetup from './_MfaSetup'

function Page() {
  return (
    <div className="bg-background flex min-h-svh flex-col gap-6 p-10">
        <MfaSetup />
        <SessionSettings />
    </div>
  )
}

export default Page