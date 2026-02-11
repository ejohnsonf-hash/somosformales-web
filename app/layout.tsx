import "./globals.css";
import Header from "@/app/components/Header";

export const metadata = {
  title: "Somos Formales",
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
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: 24,
          }}
        >
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
