"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PageHeader from "@/components/PageHeader";

type WorkerRelation = {
  id: string;
  start_date: string;
  worker: {
    id: string;
    full_name: string;
    document_number: string;
  };
};

export default function HouseholdDetailPage() {
  const { id: householdId } = useParams();
  const router = useRouter();

  const [workers, setWorkers] = useState<WorkerRelation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkers = async () => {
      const { data, error } = await supabase
        .from("employment_relationships")
        .select(
          `
          id,
          start_date,
          worker:workers (
            id,
            full_name,
            document_number
          )
        `
        )
        .eq("household_id", householdId)
        .order("start_date", { ascending: true });

      if (error) {
        console.error("ERROR CARGANDO TRABAJADORAS:", error);
        alert("No se pudieron cargar las trabajadoras");
        setLoading(false);
        return;
      }

      setWorkers(data || []);
      setLoading(false);
    };

    loadWorkers();
  }, [householdId]);

  return (
    <div style={{ padding: 40 }}>
      <PageHeader title="Hogar" backTo="/home" />

      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => router.push(`/households/${householdId}/workers/new`)}
        >
          ➕ Nueva trabajadora
        </button>
      </div>

      {loading && <p>Cargando trabajadoras…</p>}

      {!loading && workers.length === 0 && (
        <p>No hay trabajadoras registradas en este hogar.</p>
      )}

      {!loading && workers.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 16,
          }}
        >
          <thead>
            <tr>
              <th align="left">Nombre</th>
              <th align="left">DNI</th>
              <th align="left">Inicio relación</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {workers.map((rel) => (
              <tr key={rel.id}>
                <td>{rel.worker.full_name}</td>
                <td>{rel.worker.document_number}</td>
                <td>
                  {new Date(rel.start_date).toLocaleDateString("es-PE")}
                </td>
                <td>
                  <button
                    onClick={() =>
                      router.push(`/workers/${rel.worker.id}`)
                    }
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
