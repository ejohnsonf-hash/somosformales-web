"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { RMV_PEN } from "@/app/lib/constants";
import { formatDate } from "@/app/lib/formatDate";
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

type ActiveSalary = {
  id: string;
  employment_relationship_id: string;
  salary_amount: number;
  start_date: string;
};

export default function WorkerDetailPage() {
  const { id: workerId } = useParams();
  const router = useRouter();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [relations, setRelations] = useState<Relationship[]>([]);
  const [activeSalaries, setActiveSalaries] = useState<
    Record<string, ActiveSalary | null>
  >({});
  const [loading, setLoading] = useState(true);

  const [editingRelationId, setEditingRelationId] = useState<string | null>(
    null
  );
  const [newSalary, setNewSalary] = useState<number>(0);
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );

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

      const relationsList = relationsData || [];
      setRelations(relationsList);

      // 3️⃣ Salarios activos por relación
      const salariesMap: Record<string, ActiveSalary | null> = {};

      for (const rel of relationsList) {
        const { data: salaryData } = await supabase
          .from("salary_versions")
          .select("id, employment_relationship_id, salary_amount, start_date")
          .eq("employment_relationship_id", rel.id)
          .is("end_date", null)
          .maybeSingle();

        salariesMap[rel.id] = salaryData || null;
      }

      setActiveSalaries(salariesMap);
      setLoading(false);
    };

    loadData();
  }, [workerId]);

  const handleUpdateSalary = async (relationId: string) => {
    const currentSalary = activeSalaries[relationId];
    if (!currentSalary) return;

    if (newSalary <= 0) {
      alert("Ingresa un salario válido");
      return;
    }

    if (newSalary < RMV_PEN) {
      const confirmLow = confirm(
        `El salario es menor a la RMV vigente (S/ ${RMV_PEN}). ¿Deseas continuar?`
      );
      if (!confirmLow) return;
    }

    try {
      // Calcular día anterior
      const effective = new Date(effectiveDate);
      const previousDay = new Date(effective);
      previousDay.setDate(previousDay.getDate() - 1);
      const previousDayStr = previousDay.toISOString().split("T")[0];

      // 1️⃣ Cerrar salario actual
      const { error: closeError } = await supabase
        .from("salary_versions")
        .update({ end_date: previousDayStr })
        .eq("id", currentSalary.id);

      if (closeError) throw closeError;

      // 2️⃣ Crear nuevo salario
      const { error: insertError } = await supabase
        .from("salary_versions")
        .insert({
          employment_relationship_id: relationId,
          salary_amount: newSalary,
          salary_type: "monthly",
          currency: "PEN",
          start_date: effectiveDate,
          end_date: null,
          below_rmv: newSalary < RMV_PEN,
          rmv_reference: RMV_PEN,
        });

      if (insertError) throw insertError;

      alert("Salario actualizado correctamente");
      setEditingRelationId(null);
      setNewSalary(0);

      // Recargar salarios
      const { data: salaryData } = await supabase
        .from("salary_versions")
        .select("id, employment_relationship_id, salary_amount, start_date")
        .eq("employment_relationship_id", relationId)
        .is("end_date", null)
        .single();

      setActiveSalaries((prev) => ({
        ...prev,
        [relationId]: salaryData,
      }));
    } catch (err) {
      console.error("ERROR ACTUALIZANDO SALARIO:", err);
      alert("No se pudo actualizar el salario");
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Cargando…</p>;
  if (!worker) return <p style={{ padding: 40 }}>Trabajadora no encontrada</p>;

  return (
    <div style={{ padding: 40 }}>
      <PageHeader title="Detalle de trabajadora" backTo="/workers" />

      <div style={{ marginBottom: 24 }}>
        <h2>{worker.full_name}</h2>
        <p>
          {worker.document_type}: {worker.document_number}
        </p>
        {worker.birth_date && (
          <p>Fecha de nacimiento: {formatDate(worker.birth_date)}</p>
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
              <th align="left">Salario actual</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {relations.map((rel) => {
              const salary = activeSalaries[rel.id];

              return (
                <tr key={rel.id}>
                  <td>{rel.household.name}</td>
                  <td>{formatDate(rel.start_date)}</td>
                  <td>
                    {salary ? (
                      <>
                        S/ {salary.salary_amount}
                        <br />
                        <small>
                          Desde {formatDate(salary.start_date)}
                        </small>
                      </>
                    ) : (
                      "Sin salario"
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        setEditingRelationId(
                          editingRelationId === rel.id ? null : rel.id
                        )
                      }
                    >
                      Actualizar salario
                    </button>

                    {editingRelationId === rel.id && (
                      <div style={{ marginTop: 8 }}>
                        <input
                          type="number"
                          placeholder="Nuevo salario"
                          value={newSalary}
                          onChange={(e) =>
                            setNewSalary(Number(e.target.value))
                          }
                        />
                        <input
                          type="date"
                          value={effectiveDate}
                          onChange={(e) =>
                            setEffectiveDate(e.target.value)
                          }
                        />
                        <button
                          onClick={() => handleUpdateSalary(rel.id)}
                          style={{ marginLeft: 8 }}
                        >
                          Guardar
                        </button>
                      </div>
                    )}

                    <button
                      style={{ marginLeft: 8 }}
                      onClick={() =>
                        router.push(`/households/${rel.household.id}`)
                      }
                    >
                      Ver hogar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
