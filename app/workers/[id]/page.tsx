"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import ConfirmDialog from "@/app/components/ConfirmDialog";

export default function WorkerDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [worker, setWorker] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("workers")
        .select("*")
        .eq("id", id)
        .single();

      setWorker(data);
    };

    load();
  }, [id]);

  async function deactivateWorker() {
    await supabase
      .from("workers")
      .update({ is_active: false })
      .eq("id", id);

    router.back();
  }

  if (!worker) return <p style={{ padding: 40 }}>Cargando…</p>;

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => router.back()}>← Regresar</button>

      <h1>{worker.full_name}</h1>
      <p>DNI: {worker.document_number}</p>

      {worker.is_active ? (
        <>
          <button
            style={{ marginTop: 24, color: "red" }}
            onClick={() => setShowConfirm(true)}
          >
            Desactivar trabajadora
          </button>

          <ConfirmDialog
            open={showConfirm}
            title="Desactivar trabajadora"
            message="¿Seguro? No se eliminará ningún historial."
            onCancel={() => setShowConfirm(false)}
            onConfirm={deactivateWorker}
          />
        </>
      ) : (
        <p style={{ color: "orange" }}>Trabajadora inactiva</p>
      )}
    </div>
  );
}
