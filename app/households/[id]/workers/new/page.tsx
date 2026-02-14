"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { RMV_PEN } from "@/app/lib/constants";
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
  const [salaryAmount, setSalaryAmount] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = async () => {
    if (!fullName || !documentNumber) {
      alert("Completa los campos obligatorios");
      return;
    }

    if (salaryAmount <= 0) {
      alert("Ingresa un salario válido");
      return;
    }

    if (salaryAmount < RMV_PEN) {
      const confirmLowSalary = confirm(
        `El salario es menor a la RMV vigente (S/ ${RMV_PEN}). ¿Deseas continuar?`
      );
      if (!confirmLowSalary) return;
    }

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

        if (workerError || !newWorker) throw workerError;

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
      const { data: newRelation, error: relationError } = await supabase
        .from("employment_relationships")
        .insert({
          worker_id: workerId,
          household_id: householdId,
          start_date: startDate,
          regularization_mode: regularization,
          regularization_start_date: regularization ? startDate : null,
        })
        .select()
        .single();

      if (relationError || !newRelation) throw relationError;

      // 5️⃣ Crear salario
      const { error: salaryError } = await supabase
        .from("salary_versions")
        .insert({
          employment_relationship_id: newRelation.id,
          salary_amount: salaryAmount,
          salary_type: "monthly",
          currency: "PEN",
          start_date: startDate,
          end_date: null,
          below_rmv: salaryAmount < RMV_PEN,
          rmv_reference: RMV_PEN,
        });

      if (salaryError) throw salaryError;

      // 6️⃣ Redirigir
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
      <PageHeader
        title="Nueva trabajadora"
        backTo={`/households/${householdId}`}
      />

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
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label style={{ marginTop: 12 }}>Salario mensual (S/)</label>
        <input
          type="number"
          value={salaryAmount}
          onChange={(e) => setSalaryAmount(Number(e.target.value))}
          min={0}
          required
        />

        {salaryAmount > 0 && salaryAmount < RMV_PEN && (
          <small style={{ color: "orange" }}>
            Advertencia: el salario es menor a la RMV vigente (S/ {RMV_PEN})
          </small>
        )}

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