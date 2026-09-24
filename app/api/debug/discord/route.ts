import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/discord`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      step: "env-check",
      error: "Faltan DISCORD_CLIENT_ID o DISCORD_CLIENT_SECRET",
    });
  }

  // Simulamos el intercambio de código OAuth2 que hace NextAuth
  // Usamos un code fake para ver qué error devuelve Discord
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code: "fake_code_para_probar",
    redirect_uri: redirectUri,
  });

  let discordResponse;
  let discordBody;
  let discordStatus;

  try {
    discordResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    discordStatus = discordResponse.status;
    discordBody = await discordResponse.text();
  } catch (e: any) {
    return NextResponse.json({
      step: "fetch-to-discord",
      error: e.message,
    });
  }

  return NextResponse.json({
    step: "discord-response",
    clientIdPreview: clientId.slice(0, 8) + "...",
    secretLength: clientSecret.length,
    redirectUriUsado: redirectUri,
    discordStatus,
    discordBody,
    interpretacion:
      discordStatus === 400 &&
      discordBody.includes("invalid_client")
        ? "❌ El CLIENT SECRET no es válido (regenéralo en OAuth2 y actualízalo)"
        : discordStatus === 400 &&
          discordBody.includes("invalid_grant")
        ? "✅ Credenciales OK. El error 'invalid_grant' es esperado por el code fake. El problema está en otro lado."
        : discordStatus === 400 &&
          discordBody.includes("redirect_uri")
        ? "❌ El redirect_uri no coincide con el registrado en Discord"
        : discordStatus === 200
        ? "⚠️ Raro: Discord aceptó el code fake (imposible en teoría)"
        : "Ver discordBody para detalles",
  });
}
