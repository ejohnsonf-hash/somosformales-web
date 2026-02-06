"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Household = {
  id: string;
  name: string;
  created_at: string;
};

export default function HouseholdsPage() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHouseholds = async () => {
      const { data, error } = await supabase
        .from("households")
        .select("id, name, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando hogares:", error);
      } else {
        setHouseholds(data || []);
      }

      setLoading(false);
    };

    loadHouseholds();
  }, []);

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando hogares…</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Hogares</h1>

      <div style={{ marginBottom: 20 }}>
        <Link href="/households/new">
          <button>➕ Crear nuevo hogar</button>
        </Link>
      </div>

      {households.length === 0 ? (
        <p>No tienes hogares registrados aún.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {households.map((household) => (
            <li
              key={household.id}
              style={{
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 6,
                marginBottom: 10,
              }}
            >
              <strong>{household.name}</strong>
              <div style={{ marginTop: 8 }}>
                <Link href={`/households/${household.id}`}>
                  Ver hogar →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
