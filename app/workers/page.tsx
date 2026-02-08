"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";

type Worker = {
  id: string;
  full_name: string;
  document_number: string;
};

export default function WorkersPage() {
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkers = async () => {
      const { data, error } = await supabase
        .from("workers")
        .select("id, full_name, document_number")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setWorkers(data);
      }

      setLoading(false);
    };

    loadWorkers();
  }, []);

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando trabajadoras…</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      <PageHeader title="Trabajadoras" />

      <button
        onClick={() => router.push("/workers/new")}
        style={{ marginBottom: 24 }}
      >
        + Nueva trabajadora
      </button>

      {workers.length === 0 ? (
        <p>No hay trabajadoras registradas.</p>
      ) : (
        <ul style={{ padding: 0, listStyle: "none" }}>
          {workers.map((w) => (
            <li
              key={w.id}
              onClick={() => router.push(`/workers/${w.id}`)}
              style={{
                padding: 16,
                border: "1px solid var(--border)",
                borderRadius: 8,
                marginBottom: 12,
                cursor: "pointer",
              }}
            >
              <strong>{w.full_name}</strong>
              <p>DNI: {w.document_number}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
