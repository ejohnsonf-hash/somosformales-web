"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Household = {
  id: string;
  name: string;
};

export default function HomePage() {
  const router = useRouter();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [activeHousehold, setActiveHousehold] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      const storedHousehold = localStorage.getItem("active_household_id");
      setActiveHousehold(storedHousehold);

      const { data, error } = await supabase
        .from("households")
        .select("id, name")
        .order("created_at", { ascending: false });

      if (error) {
        alert("Error cargando hogares");
        console.error(error);
      } else {
        setHouseholds(data ?? []);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const selectHousehold = (id: string) => {
    localStorage.setItem("active_household_id", id);
    setActiveHousehold(id);
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando hogares…</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Selecciona un hogar</h1>

      <button onClick={() => router.push("/households/new")}>
        ➕ Nuevo hogar
      </button>

      <ul style={{ marginTop: 20 }}>
        {households.map((h) => (
          <li key={h.id} style={{ marginBottom: 8 }}>
            <button
              onClick={() => selectHousehold(h.id)}
              style={{
                fontWeight: activeHousehold === h.id ? "bold" : "normal",
              }}
            >
              {h.name}
              {activeHousehold === h.id && " ✅"}
            </button>
          </li>
        ))}
      </ul>

      {activeHousehold && (
        <p style={{ marginTop: 20 }}>
          Hogar activo seleccionado ✔
        </p>
      )}
    </div>
  );
}
