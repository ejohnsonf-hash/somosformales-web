import "./globals.css";
import Header from "./components/Header";

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
        <div className="app-container">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}


