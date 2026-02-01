import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SomosFormales",
  description: "Formalización del trabajo del hogar en Perú",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
