"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Worker = {
  id: string;
  full_name: string;
  document_type: string;
  document_number: string;
  birth_date: string | null;
};

type EmploymentRelationship = {
  start_date: string;
};

export default function WorkerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params.id as string;

  const [worker, setWorker] = useState<Worker | null>(null);
  const [relationship, setRelationship] =
    useState<EmploymentRelationship | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // 1️⃣ Datos de la trabajadora
      const { data: workerData } = await supabase
        .from("workers")
        .select(
          "id, full_name, document_type, document_number, birth_date"
        )
        .eq("id", workerId)
        .single();

      // 2️⃣ Relación laboral activa
      const { data: relationshipData } = await supabase
        .from("employment_relationships")
        .select("start_date")
        .eq("worker_id", workerId)
        .is("end_date", null)
        .single();

      setWorker(workerData);
      setRelationship(relationshipData);
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
      <button onClick={() => router.back()}>← Regresar</button>

      <h1 style={{ marginTop: 20 }}>{worker.full_name}</h1>

      <p>
        <strong>Documento:</strong>{" "}
        {worker.document_type} {worker.document_number}
      </p>

      {worker.birth_date && (
        <p>
          <strong>Fecha de nacimiento:</strong>{" "}
          {worker.birth_date}
        </p>
      )}

      {relationship && (
        <p>
          <strong>Inicio de relación laboral:</strong>{" "}
          {relationship.start_date}
        </p>
      )}

      {!relationship && (
        <p style={{ color: "orange" }}>
          No se encontró relación laboral activa
        </p>
      )}
    </div>
  );
}
