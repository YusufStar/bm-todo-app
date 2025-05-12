"use client";
import React, { useCallback } from "react";
import SessionItem from "./_SessionItem";
import { useMutation, useQuery } from "@tanstack/react-query";
import { sessionDelMutationFn, sessionsQueryFn } from "@/lib/api";
import { Loader } from "lucide-react";
import { toast } from "sonner";

const SessionSettings = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["sessions"],
    queryFn: sessionsQueryFn,
    staleTime: Infinity,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: sessionDelMutationFn,
  });

  const sessions = data?.sessions || [];

  const currentSession = sessions?.find((session) => session.isCurrent);
  const otherSessions = sessions?.filter(
    (session) => session.isCurrent !== true
  );

  const handleDelete = useCallback((id: string) => {
    mutate(id, {
      onSuccess: () => {
        refetch();
        toast.success("Session removed successfully")
      },
      onError: (error) => {
        toast.error(error.message)
      },
    });
  }, []);

  return (
    <div className="w-full">
      <h3 className="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-1">
        Sessions
      </h3>
      <p className="mb-6 text-sm font-normal">
        Sessions are the devices you are using or that have used your B&M
        These are the sessions where your account is currently logged in. You
        can log out of each session.
      </p>
      {isLoading ? (
        <Loader size="35px" className="animate-spin" />
      ) : (
        <div className="rounded-t-xl">
          <div>
            <h5 className="text-base font-semibold">
              Current active session
            </h5>
            <p className="mb-6 text-sm">
              You’re logged into this B&M account on this device and are
              currently using it.
            </p>
          </div>
          <div className="w-full">
            {currentSession && (
              <div className="w-full py-2 border-b pb-5">
                <SessionItem
                  userAgent={currentSession.userAgent}
                  date={currentSession.createdAt}
                  expiresAt={currentSession.expiresAt}
                  isCurrent={currentSession.isCurrent}
                />
              </div>
            )}
            <div className="mt-4">
              <h5 className="text-base font-semibold">Other sessions</h5>
              <ul
                className="mt-4 w-full space-y-3 max-h-[400px
                overflow-y-auto
                "
              >
                {otherSessions.length > 0 ? otherSessions?.map((session) => (
                  <li>
                    <SessionItem
                      loading={isPending}
                      userAgent={session.userAgent}
                      date={session.createdAt}
                      expiresAt={session.expiresAt}
                      onRemove={() => handleDelete(session._id)}
                    />
                  </li>
                )) : (
                  <div className="w-full flex items-center justify-center py-12 border-border rounded-lg border bg-card">
                    <p className="text-sm">
                      No other sessions found
                    </p>
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionSettings;