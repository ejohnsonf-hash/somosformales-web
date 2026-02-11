"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PageHeader from "@/components/PageHeader";

type Household = {
  id: string;
  name: string;
  created_at: string;
};

export default function HouseholdsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [households, setHouseholds] = useState<Household[]>([]);

  useEffect(() => {
    const loadHouseholds = async () => {
      // Validar sesión
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      // Cargar hogares
      const { data, error } = await supabase
        .from("households")
        .select("id, name, created_at")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error cargando hogares", error);
      } else {
        setHouseholds(data ?? []);
      }

      setLoading(false);
    };

    loadHouseholds();
  }, [router]);

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando…</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      {/* ÚNICO header de página */}
      <PageHeader title="Hogares" backTo="/home" />

      {/* Acción principal */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => router.push("/households/new")}>
          ➕ Crear nuevo hogar
        </button>
      </div>

      {/* Lista */}
      {households.length === 0 ? (
        <p>No tienes hogares registrados.</p>
      ) : (
        <ul style={{ paddingLeft: 16 }}>
          {households.map((h) => (
            <li key={h.id} style={{ marginBottom: 8 }}>
              <a
                href={`/households/${h.id}`}
                style={{ cursor: "pointer", textDecoration: "underline" }}
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

