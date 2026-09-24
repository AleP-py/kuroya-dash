import { Header } from "@/app/components/Header";

export default function ServersPage() {
  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Tus servidores</h1>
        <p className="text-purple-200/70 text-sm mb-8">
          Aquí aparecerán los servidores donde puedes configurar Kuroya.
        </p>
        <div className="bg-[#1b172e]/80 border border-[#3b2d63] rounded-xl p-8 text-center text-purple-200/60">
          🔧 En construcción — conectaremos esto a la API del bot.
        </div>
      </main>
    </>
  );
}
