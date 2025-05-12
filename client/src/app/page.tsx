import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to B&M Todo App</h1>
      <p className="mt-4 text-lg">
        This is a complex todo app built with Next.js, TypeScript, and Tailwind CSS.
      </p>
    </div>
  );
}
