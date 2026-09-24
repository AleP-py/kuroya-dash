import "./globals.css";

export const metadata = {
  title: "Kuroya Dashboard",
  description: "Panel de configuración de Kuroya",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans min-h-screen">{children}</body>
    </html>
  );
}
