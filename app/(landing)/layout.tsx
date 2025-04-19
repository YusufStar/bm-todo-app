import { Navbar } from "@/components/navbar";
import { auth } from "@/auth";
import { User } from "@prisma/client";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="relative flex flex-col h-screen">
      <Navbar user={session?.user as User} />
      <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
        {children}
      </main>
    </div>
  );
}
