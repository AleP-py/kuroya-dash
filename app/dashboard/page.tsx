import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-purple-300 mb-4">
        Bienvenido, {session.user?.name}
      </h1>
      <p className="text-purple-200/70">
        Aquí irá la lista de servidores donde puedes configurar Kuroya.
      </p>
      <pre className="mt-6 bg-[#1b172e] p-4 rounded-lg text-xs overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </main>
  );
}
