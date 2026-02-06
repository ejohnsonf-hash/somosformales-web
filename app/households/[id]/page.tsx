"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import Link from "next/link";

type Household = {
  id: string;
  name: string;
};

type Worker = {
  id: string;
  full_name: string;
  document_number: string;
  birth_date: string | null;
};

export default function HouseholdDetailPage() {
  const params = useParams();
  const householdId = params.id as string;

  const [household, setHousehold] = useState<Household | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // 1️⃣ Traer hogar
      const { data: householdData, error: householdError } = await supabase
        .from("households")
        .select("id, name")
        .eq("id", householdId)
        .single();

      if (householdError) {
        console.error(householdError);
        setLoading(false);
        return;
      }

      setHousehold(householdData);

      // 2️⃣ Traer trabajadoras del hogar
      const { data: workersData, error: workersError } = await supabase
        .from("workers")
        .select("id, full_name, document_number, birth_date")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false });

      if (workersError) {
        console.error(workersError);
      } else {
        setWorkers(workersData || []);
      }

      setLoading(false);
    };

    loadData();
  }, [householdId]);

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando hogar…</p>;
  }

  if (!household) {
    return <p style={{ padding: 40 }}>Hogar no encontrado</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      <Link href="/households">← Volver a hogares</Link>

      <h1 style={{ marginTop: 20 }}>{household.name}</h1>

      <div style={{ margin: "20px 0" }}>
        <Link href={`/workers/new?household_id=${household.id}`}>
          <button>➕ Nueva trabajadora</button>
        </Link>
      </div>

      <h2>Trabajadoras</h2>

      {workers.length === 0 ? (
        <p>No hay trabajadoras registradas en este hogar.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {workers.map((worker) => (
            <li
              key={worker.id}
              style={{
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 6,
                marginBottom: 10,
              }}
            >
              <strong>{worker.full_name}</strong>
              <div>DNI: {worker.document_number}</div>
              {worker.birth_date && (
                <div>Fecha de nacimiento: {worker.birth_date}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
