"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setEmail(data.user.email ?? null);
      setLoading(false);
    };

    loadUser();
  }, [router]);

  if (loading) {
    return <p>Cargando…</p>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Inicio</h1>

      <p style={{ marginBottom: 24 }}>
        Bienvenido{email ? `, ${email}` : ""}.  
        Desde aquí puedes gestionar tus hogares y trabajadoras.
      </p>

      <div style={{ display: "flex", gap: 16 }}>
        <button
          onClick={() => router.push("/households")}
          style={{
            padding: "12px 16px",
            cursor: "pointer",
          }}
        >
          🏠 Gestionar hogares
        </button>

        <button
          onClick={() => router.push("/workers")}
          style={{
            padding: "12px 16px",
            cursor: "pointer",
          }}
        >
          👩‍🍳 Ver trabajadoras
        </button>
      </div>
    </div>
  );
}

