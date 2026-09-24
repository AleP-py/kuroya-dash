import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Kuroya Dashboard",
  description: "Panel de configuración de Kuroya",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="font-sans min-h-screen bg-[#0b0914] text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
