"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Household = {
  id: string;
  name: string;
};

type Worker = {
  id: string;
  full_name: string;
};

export default function HouseholdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const householdId = params.id as string;

  const [household, setHousehold] = useState<Household | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: householdData } = await supabase
        .from("households")
        .select("id, name")
        .eq("id", householdId)
        .single();

      const { data: workersData } = await supabase
        .from("workers")
        .select("id, full_name")
        .eq("household_id", householdId);

      setHousehold(householdData);
      setWorkers(workersData || []);
      setLoading(false);
    };

    loadData();
  }, [householdId]);

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando…</p>;
  }

  if (!household) {
    return <p style={{ padding: 40 }}>Hogar no encontrado</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      {/* 🔙 BOTÓN REGRESAR */}
      <button onClick={() => router.push("/home")}>
        ← Volver al inicio
      </button>

      <h1 style={{ marginTop: 20 }}>{household.name}</h1>

      <h2 style={{ marginTop: 30 }}>Trabajadoras</h2>

      {workers.length === 0 && <p>No hay trabajadoras registradas</p>}

      <ul>
        {workers.map((w) => (
          <li key={w.id}>
            <Link href={`/workers/${w.id}`}>{w.full_name}</Link>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <Link href={`/workers/new?household_id=${household.id}`}>
          ➕ Nueva trabajadora
        </Link>
      </div>
    </div>
  );
}
