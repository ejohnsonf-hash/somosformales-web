import "./globals.css";

export const metadata = {
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

