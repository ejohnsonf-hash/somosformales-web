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
      setMessage("📩 Te enviamos un link a tu correo para iniciar sesión.");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: 32,
          borderRadius: 8,
          width: 360,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ marginBottom: 16 }}>Entrar a Somos Formales</h1>

        <label>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 4,
            marginBottom: 12,
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            background: "#111",
            color: "white",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Enviando..." : "Entrar con magic link"}
        </button>

        {message && (
          <p style={{ marginTop: 16, fontSize: 14 }}>{message}</p>
        )}
      </form>
    </div>
  );
}


