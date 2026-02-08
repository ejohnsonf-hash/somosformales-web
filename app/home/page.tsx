"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/app/components/Header";

type Household = {
  id: string;
  name: string;
};

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [households, setHouseholds] = useState<Household[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1️⃣ Verificar sesión
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      // 2️⃣ Cargar hogares
      const { data: householdsData, error } = await supabase
        .from("households")
        .select("id, name")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error cargando hogares", error);
      } else {
        setHouseholds(householdsData ?? []);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando…</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      <Header />

      <h1 style={{ marginBottom: 8 }}>Inicio</h1>
      <p style={{ marginBottom: 24 }}>
        Administra tus hogares y trabajadoras del hogar.
      </p>

      {/* Acciones principales */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <button onClick={() => router.push("/households/new")}>
          ➕ Nuevo hogar
        </button>

        <button onClick={() => router.push("/workers/new")}>
          ➕ Nueva trabajadora
        </button>
      </div>

      {/* Lista de hogares */}
      <h2 style={{ marginBottom: 12 }}>Mis hogares</h2>

      {households.length === 0 ? (
        <p>No tienes hogares registrados aún.</p>
      ) : (
        <ul style={{ paddingLeft: 16 }}>
          {households.map((h) => (
            <li key={h.id} style={{ marginBottom: 8 }}>
              <a
                href={`/households/${h.id}`}
                style={{ textDecoration: "underline", cursor: "pointer" }}
              >
                {h.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
