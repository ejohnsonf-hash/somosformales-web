"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/app/components/ConfirmDialog";

export default function NewWorkerFromHouseholdPage() {
  const { id: householdId } = useParams();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);

  const [regularization, setRegularization] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // =========================
  // SUBMIT FLOW
  // =========================
  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 1️⃣ Buscar trabajadora por DNI
      const { data: existingWorker, error: searchError } = await supabase
        .from("workers")
        .select("id")
        .eq("document_number", documentNumber)
        .maybeSingle();

      if (searchError) throw searchError;

      let workerId = existingWorker?.id;

      // 2️⃣ Crear trabajadora si no existe
      if (!workerId) {
        const { data: newWorker, error: workerError } = await supabase
          .from("workers")
          .insert({
            full_name: fullName,
            document_type: "DNI",
            document_number: documentNumber,
            birth_date: birthDate || null,
            household_id: householdId,
          })
          .select()
          .single();

        if (workerError || !newWorker) {
          throw workerError;
        }

        workerId = newWorker.id;
      }

      // 3️⃣ Verificar si ya existe relación con este hogar
      const { data: existingRelation } = await supabase
        .from("employment_relationships")
        .select("id")
        .eq("worker_id", workerId)
        .eq("household_id", householdId)
        .maybeSingle();

      if (existingRelation) {
        alert("Esta trabajadora ya está asociada a este hogar");
        setLoading(false);
        return;
      }

      // 4️⃣ Crear relación laboral
      const { error: relationError } = await supabase
        .from("employment_relationships")
        .insert({
          worker_id: workerId,
          household_id: householdId,
          start_date: startDate,
          regularization_mode: regularization,
          regularization_start_date: regularization ? startDate : null,
        });

      if (relationError) throw relationError;

      // 5️⃣ Volver al hogar
      router.push(`/households/${householdId}`);
    } catch (err) {
      console.error("ERROR CREANDO TRABAJADORA:", err);
      alert("No se pudo registrar la trabajadora");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <PageHeader title="Nueva trabajadora" backTo={`/households/${householdId}`} />

      <div style={{ maxWidth: 480 }}>
        <label>Nombre completo</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <label>DNI</label>
        <input
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          required
        />

        <label>Fecha de nacimiento</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />

        <label style={{ marginTop: 12 }}>
          <input
            type="checkbox"
            checked={regularization}
            onChange={(e) => setRegularization(e.target.checked)}
          />{" "}
          Regularización
        </label>

        <label>Inicio de relación laboral</label>
        <input
          type="date"
          value={startDate}
          disabled={!regularization}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <button
          onClick={() => setConfirmOpen(true)}
          disabled={loading}
          style={{ marginTop: 20 }}
        >
          Guardar
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar creación"
        message="¿Confirmas que deseas registrar esta trabajadora en este hogar?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
      />
    </div>
  );
}
