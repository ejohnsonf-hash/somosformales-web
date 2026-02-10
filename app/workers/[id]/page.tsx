"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PageHeader from "@/components/PageHeader";

type Worker = {
  id: string;
  full_name: string;
  document_type: string;
  document_number: string;
  birth_date: string | null;
};

type Relationship = {
  id: string;
  start_date: string;
  household: {
    id: string;
    name: string;
  };
};

export default function WorkerDetailPage() {
  const { id: workerId } = useParams();
  const router = useRouter();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [relations, setRelations] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // 1️⃣ Trabajadora
      const { data: workerData, error: workerError } = await supabase
        .from("workers")
        .select("*")
        .eq("id", workerId)
        .single();

      if (workerError) {
        console.error("ERROR WORKER:", workerError);
        alert("No se pudo cargar la trabajadora");
        setLoading(false);
        return;
      }

      setWorker(workerData);

      // 2️⃣ Relaciones laborales
      const { data: relationsData, error: relationsError } = await supabase
        .from("employment_relationships")
        .select(
          `
          id,
          start_date,
          household:households (
            id,
            name
          )
        `
        )
        .eq("worker_id", workerId)
        .order("start_date", { ascending: true });

      if (relationsError) {
        console.error("ERROR RELATIONS:", relationsError);
        alert("No se pudieron cargar las relaciones laborales");
        setLoading(false);
        return;
      }

      setRelations(relationsData || []);
      setLoading(false);
    };

    loadData();
  }, [workerId]);

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando…</p>;
  }

  if (!worker) {
    return <p style={{ padding: 40 }}>Trabajadora no encontrada</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      <PageHeader title="Detalle de trabajadora" backTo="/workers" />

      <div style={{ marginBottom: 24 }}>
        <h2>{worker.full_name}</h2>
        <p>
          {worker.document_type}: {worker.document_number}
        </p>
        {worker.birth_date && (
          <p>
            Fecha de nacimiento:{" "}
            {new Date(worker.birth_date).toLocaleDateString("es-PE")}
          </p>
        )}
      </div>

      <h3>Relaciones laborales</h3>

      {relations.length === 0 && (
        <p>Esta trabajadora no tiene relaciones laborales activas.</p>
      )}

      {relations.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 12,
          }}
        >
          <thead>
            <tr>
              <th align="left">Hogar</th>
              <th align="left">Inicio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {relations.map((rel) => (
              <tr key={rel.id}>
                <td>{rel.household.name}</td>
                <td>
                  {new Date(rel.start_date).toLocaleDateString("es-PE")}
                </td>
                <td>
                  <button
                    onClick={() =>
                      router.push(`/households/${rel.household.id}`)
                    }
                  >
                    Ver hogar
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
