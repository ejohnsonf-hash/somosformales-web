"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import ConfirmDialog from "@/app/components/ConfirmDialog";

export default function NewWorkerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const householdId = searchParams.get("householdId");

  const [fullName, setFullName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  async function createWorker() {
    setLoading(true);

    const { error } = await supabase.from("workers").insert({
      full_name: fullName,
      document_type: "DNI",
      document_number: documentNumber,
      household_id: householdId,
    });

    setLoading(false);

    if (error) {
      alert("Error creando trabajadora");
      console.error(error);
      return;
    }

    router.push(`/households/${householdId}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowConfirm(true);
  }

  return (
    <div style={{ padding: 40, maxWidth: 480 }}>
      <h1>Nueva trabajadora</h1>

      <form onSubmit={handleSubmit}>
        <label>Nombre completo</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ width: "100%", marginBottom: 12 }}
        />

        <label>DNI</label>
        <input
          required
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          style={{ width: "100%", marginBottom: 20 }}
        />

        <button type="submit" disabled={loading}>
          Crear trabajadora
        </button>
      </form>

      <ConfirmDialog
        open={showConfirm}
        title="Confirmar creación"
        message="¿Confirmas que deseas crear esta trabajadora? Luego no podrá eliminarse, solo desactivarse."
        onCancel={() => setShowConfirm(false)}
        onConfirm={createWorker}
      />
    </div>
  );
}
