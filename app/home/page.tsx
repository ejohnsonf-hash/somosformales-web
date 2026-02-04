"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Household = {
  id: string;
  name: string;
  created_at: string;
};

export default function HomePage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // 1️⃣ Usuario
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      setEmail(userData.user.email ?? null);

      // 2️⃣ Hogares
      const { data, error } = await supabase
        .from("households")
        .select("id, name, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando hogares:", error);
      } else {
        setHouseholds(data ?? []);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  if (loading) {
    return <p style={{ padding: 32 }}>Cargando…</p>;
  }

  return (
    <main
      style={{
        padding: 32,
        maxWidth: 1100,
      }}
    >
      {/* HEADER */}
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ margin: 0 }}>Somos Formales</h1>
        <p style={{ marginTop: 4, opacity: 0.7 }}>
          Bienvenido{email ? `, ${email}` : ""}
        </p>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          style={{
            marginTop: 16,
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid color-mix(in srgb, CanvasText 25%, transparent)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </header>

      {/* HOGARES */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: 0 }}>Hogares</h2>

          <button
            onClick={() => router.push("/households/new")}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "none",
              background: "color-mix(in srgb, CanvasText 90%, transparent)",
              color: "Canvas",
              cursor: "pointer",
            }}
          >
            + Nuevo hogar
          </button>
        </div>

        {/* LISTA */}
        {households.length === 0 ? (
          <div
            style={{
              border: "1px dashed color-mix(in srgb, CanvasText 30%, transparent)",
              borderRadius: 12,
              padding: 24,
              maxWidth: 420,
            }}
          >
            <p style={{ marginBottom: 16 }}>
              Aún no has creado ningún hogar
            </p>

            <button
              onClick={() => router.push("/households/new")}
              style={{
                padding: "10px 16px",
                borderRadius: 6,
                border: "none",
                background:
                  "color-mix(in srgb, CanvasText 90%, transparent)",
                color: "Canvas",
                cursor: "pointer",
              }}
            >
              Crear primer hogar
            </button>
          </div>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {households.map((h) => (
              <li
                key={h.id}
                style={{
                  border:
                    "1px solid color-mix(in srgb, CanvasText 20%, transparent)",
                  borderRadius: 10,
                  padding: 16,
                  cursor: "pointer",
                }}
                onClick={() => router.push(`/households/${h.id}`)}
              >
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>
                  {h.name}
                </h3>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.6 }}>
                  Creado el{" "}
                  {new Date(h.created_at).toLocaleDateString("es-PE")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
