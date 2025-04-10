import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="w-full p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>
      <main className="p-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">Welcome to the Dashboard</h2>
          <p>This is your dashboard content.</p>
        </div>
      </main>
    </div>
  );
}
