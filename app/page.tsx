import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-purple-300">
        🚀 Kuroya Dashboard
      </h1>
      <p className="text-purple-200/70">
        Configura tu bot desde aquí.
      </p>
      <Link
        href="/api/auth/signin/discord"
        className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-lg font-medium transition"
      >
        Iniciar sesión con Discord
      </Link>
    </main>
  );
}
