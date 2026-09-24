"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Header() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-[#181525]/90 backdrop-blur-md border-b border-[#2d244a] px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50">
      <Link href="/" className="flex items-center space-x-3 group">
        <img
          src="https://i.imgur.com/uK0g6DX.jpeg"
          alt="Kuroya Logo"
          className="w-10 h-10 rounded-full object-cover shadow border border-indigo-500"
        />
        <span className="text-xl font-bold tracking-wide text-white group-hover:text-indigo-400 transition">
          Kuroya
        </span>
      </Link>

      <nav className="flex items-center space-x-4 sm:space-x-6">
        <Link href="/" className="hover:text-indigo-400 font-medium text-sm transition hidden sm:inline">
          Inicio
        </Link>
        <Link href="/servers" className="hover:text-indigo-400 font-medium text-sm transition hidden sm:inline">
          Servidores
        </Link>

        {status === "loading" && (
          <div className="w-10 h-10 rounded-full bg-[#1b172e] animate-pulse" />
        )}

        {status === "unauthenticated" && (
          <Link
            href="/api/auth/signin/discord?callbackUrl=/servers"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2"
          >
            <i className="fa-brands fa-discord"></i> Iniciar sesión
          </Link>
        )}

        {status === "authenticated" && session?.user && (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 hover:bg-[#1b172e] p-1 pr-3 rounded-full transition"
            >
              <img
                src={session.user.image || "https://cdn.discordapp.com/embed/avatars/0.png"}
                alt={session.user.name || "User"}
                className="w-9 h-9 rounded-full border border-indigo-500"
              />
              <span className="text-sm text-white font-medium hidden sm:inline">
                {session.user.name}
              </span>
              <i className="fa-solid fa-chevron-down text-xs text-purple-300/60"></i>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-[#1b172e] border border-[#3b2d63] rounded-xl shadow-2xl overflow-hidden z-50">
                <Link
                  href="/servers"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#251c3e] text-sm text-white transition"
                >
                  <i className="fa-solid fa-server text-purple-300"></i>
                  Servidores
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#251c3e] text-sm text-red-300 transition border-t border-[#3b2d63]"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
