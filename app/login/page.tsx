"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000",
      },
    });

    if (error) {
      setMessage("❌ Error enviando el link. Intenta de nuevo.");
    } else {
      setMessage("📩 Te enviamos un link a tu correo.");
    }

    setLoading(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: 360,
          padding: 24,
          borderRadius: 12,
          border: "1px solid color-mix(in srgb, CanvasText 15%, transparent)",
        }}
      >
        <h1 style={{ marginBottom: 12 }}>Somos Formales</h1>
        <p style={{ marginBottom: 20, opacity: 0.8 }}>
          Ingresa tu correo para continuar
        </p>

        <label style={{ fontSize: 14 }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          style={{
            width: "100%",
            padding: 10,
            marginTop: 4,
            marginBottom: 16,
            borderRadius: 6,
            border: "1px solid color-mix(in srgb, CanvasText 25%, transparent)",
            background: "transparent",
            color: "inherit",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            background: "color-mix(in srgb, CanvasText 90%, transparent)",
            color: "Canvas",
          }}
        >
          {loading ? "Enviando..." : "Entrar con magic link"}
        </button>

        {message && (
          <p style={{ marginTop: 16, fontSize: 14 }}>{message}</p>
        )}
      </form>
    </main>
  );
}


