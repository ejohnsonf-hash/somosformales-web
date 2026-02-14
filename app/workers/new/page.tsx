"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { RMV_PEN } from "@/app/lib/constants";
import PageHeader from "@/components/PageHeader";

type Household = {
  id: string;
  name: string;
};

export default function NewWorkerPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [selectedHousehold, setSelectedHousehold] = useState("");

  const [fullName, setFullName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [isRegularization, setIsRegularization] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [initialVacationBalance, setInitialVacationBalance] = useState(0);
  const [regularizationNotes, setRegularizationNotes] = useState("");

  const [salaryAmount, setSalaryAmount] = useState<number>(0);

  useEffect(() => {
    const loadHouseholds = async () => {
      const { data, error } = await supabase
        .from("households")
        .select("id, name")
        .order("created_at", { ascending: true });

      if (!error && data) {
        setHouseholds(data);
      }
    };

    loadHouseholds();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHousehold) {
      alert("Selecciona un hogar");
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
      // 🔎 Validar duplicado por DNI
      const { data: existingWorker } = await supabase
        .from("workers")
        .select("id")
        .eq("document_number", documentNumber)
        .maybeSingle();

      let workerId = existingWorker?.id;

      // 🧱 Crear trabajadora si no existe
      if (!workerId) {
        const { data: newWorker, error: workerError } = await supabase
          .from("workers")
          .insert([
            {
              full_name: fullName,
              document_type: "DNI",
              document_number: documentNumber,
              birth_date: birthDate || null,
              household_id: selectedHousehold,
            },
          ])
          .select()
          .single();

        if (workerError || !newWorker) {
          console.error("ERROR CREANDO TRABAJADORA:", workerError);
          alert("No se pudo registrar la trabajadora");
          return;
        }

        workerId = newWorker.id;
      }

      // 🔎 Validar que no exista ya relación con ese hogar
      const { data: existingRelation } = await supabase
        .from("employment_relationships")
        .select("id")
        .eq("worker_id", workerId)
        .eq("household_id", selectedHousehold)
        .maybeSingle();

      if (existingRelation) {
        alert("Esta trabajadora ya está asociada a este hogar.");
        router.push(`/households/${selectedHousehold}`);
        return;
      }

      // 📌 Crear relación laboral
      const { data: newRelation, error: relationError } = await supabase
        .from("employment_relationships")
        .insert([
          {
            worker_id: workerId,
            household_id: selectedHousehold,
            start_date: startDate,
            regularization_mode: isRegularization,
            regularization_start_date: isRegularization ? startDate : null,
            regularization_notes: isRegularization
              ? regularizationNotes
              : null,
            initial_vacation_balance: isRegularization
              ? initialVacationBalance
              : 0,
          },
        ])
        .select()
        .single();

      if (relationError || !newRelation) {
        console.error("ERROR CREANDO RELACIÓN:", relationError);
        alert("Trabajadora creada, pero falló la relación laboral");
        return;
      }

      // 💰 Crear salary_version
      const { error: salaryError } = await supabase
        .from("salary_versions")
        .insert([
          {
            employment_relationship_id: newRelation.id,
            salary_amount: salaryAmount,
            salary_type: "monthly",
            currency: "PEN",
            start_date: startDate,
            end_date: null,
            below_rmv: salaryAmount < RMV_PEN,
            rmv_reference: RMV_PEN,
          },
        ]);

      if (salaryError) {
        console.error("ERROR CREANDO SALARIO:", salaryError);
        alert("Relación creada, pero falló el registro del salario");
        return;
      }

      router.push(`/households/${selectedHousehold}`);
    } catch (err) {
      console.error("ERROR:", err);
      alert("No se pudo registrar la trabajadora");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <PageHeader title="Nueva trabajadora" backTo="/workers" />

      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        <div style={{ marginBottom: 16 }}>
          <label>Hogar</label>
          <select
            value={selectedHousehold}
            onChange={(e) => setSelectedHousehold(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          >
            <option value="">Selecciona un hogar</option>
            {households.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Nombre completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>DNI</label>
          <input
            type="text"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            <input
              type="checkbox"
              checked={isRegularization}
              onChange={(e) => setIsRegularization(e.target.checked)}
            />{" "}
            Regularización
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Fecha inicio relación laboral</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {isRegularization && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label>Vacaciones pendientes (días)</label>
              <input
                type="number"
                value={initialVacationBalance}
                onChange={(e) =>
                  setInitialVacationBalance(Number(e.target.value))
                }
                min={0}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Notas de regularización</label>
              <textarea
                value={regularizationNotes}
                onChange={(e) =>
                  setRegularizationNotes(e.target.value.slice(0, 500))
                }
                maxLength={500}
                placeholder="Detalles relevantes de la situación previa..."
                style={{ width: "100%", padding: 8, minHeight: 100 }}
              />
              <small>
                {regularizationNotes.length}/500 caracteres
              </small>
            </div>
          </>
        )}

        <div style={{ marginBottom: 16 }}>
          <label>Salario mensual (S/)</label>
          <input
            type="number"
            value={salaryAmount}
            onChange={(e) => setSalaryAmount(Number(e.target.value))}
            min={0}
            required
            style={{ width: "100%", padding: 8 }}
          />
          {salaryAmount > 0 && salaryAmount < RMV_PEN && (
            <small style={{ color: "orange" }}>
              Advertencia: el salario es menor a la RMV vigente (S/ {RMV_PEN})
            </small>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar trabajadora"}
        </button>
      </form>
    </div>
  );
}