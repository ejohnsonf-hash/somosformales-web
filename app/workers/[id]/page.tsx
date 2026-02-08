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
      // 1️⃣ Obtener trabajadora
      const { data: workerData, error: workerError } = await supabase
        .from("workers")
        .select("*")
        .eq("id", workerId)
        .single();

      if (workerError || !workerData) {
        alert("No se pudo cargar la trabajadora");
        router.push("/workers");
        return;
      }

      setWorker(workerData);

      // 2️⃣ Obtener relación laboral activa
      const { data: relationData, error: relationError } = await supabase
        .from("employment_relationships")
        .select("start_date")
        .eq("worker_id", workerId)
        .is("end_date", null)
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!relationError && relationData) {
        setRelationship(relationData);
      }

      setLoading(false);
    };

    loadData();
  }, [workerId, router]);

  if (loading) {
    return <p style={{ padding: 40 }}>Cargando…</p>;
  }

  if (!worker) return null;

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => router.back()} style={{ marginBottom: 20 }}>
        ← Regresar
      </button>

      <h1>{worker.full_name}</h1>

      <p>
        <strong>Documento:</strong> {worker.document_type}{" "}
        {worker.document_number}
      </p>

      <p>
        <strong>Fecha de nacimiento:</strong>{" "}
        {worker.birth_date ?? "No registrada"}
      </p>

      <p>
        <strong>Inicio de relación laboral:</strong>{" "}
        {relationship
          ? new Date(relationship.start_date).toLocaleDateString("es-PE")
          : "No se encontró relación laboral activa"}
      </p>
    </div>
  );
}
