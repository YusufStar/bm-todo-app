"use client"
import React from 'react'
import SessionSettings from './_SessionSettings'
import MfaSetup from './_MfaSetup'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

function Security() {
  return <>
    <MfaSetup />
    <Separator className="my-4" />
    <SessionSettings />
  </>
}

function Informations() {
  return (
    <div className="w-full">
      <h3 className="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
        Informations
      </h3>
      <p className="mb-6 text-sm font-normal">
        Informations are the devices you are using or that have used your B&M
        These are the sessions where your account is currently logged in. You
        can log out of each session.
      </p>
    </div>
  )
}

function Page() {
  const [activeTab, setActiveTab] = React.useState('security')

  const tabs = [
    {
      id: "security",
      label: "Security",
      header: "Account Security",
      content: <Security />
    },
    {
      id: "informations",
      label: "Informations",
      header: "Account Informations",
      content: <Informations />
    }
  ]
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
  }

  return (
    <div className="h-full w-full flex overflow-hidden gap-6">
      <div className="flex-[0.20] flex flex-col gap-4">
        <span className="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
          Account Settings
        </span>

        <div className='flex flex-col gap-2'>
          <Button
            variant={activeTab === 'security' ? 'outline' : 'secondary'}
            className='w-full'
            onClick={() => handleTabClick('security')}
          >
            Security
          </Button>

          <Button
            variant={activeTab === 'informations' ? 'outline' : 'secondary'}
            className='w-full'
            onClick={() => handleTabClick('informations')}
          >
            Informations
          </Button>
        </div>
      </div>

      {
        activeTabContent && (
          <div className="flex-[0.80] flex flex-col gap-4">
            <span className="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
              {tabs.find((tab) => tab.id === activeTab)?.header}
            </span>
            <Separator />
            {activeTabContent}
          </div>
        )
      }
    </div>
  )
}

export default Page