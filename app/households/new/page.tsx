
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewHouseholdPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Sesión inválida");
      return;
    }

    const { error } = await supabase.from("households").insert({
      user_id: userData.user.id,
      name,
      address: address || null,
    });

    if (error) {
      alert("Error creando hogar");
      console.error(error);
    } else {
      router.push("/home");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Nuevo hogar</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label>
          <br />
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Dirección</label>
          <br />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <button style={{ marginTop: 20 }} disabled={loading}>
          {loading ? "Creando…" : "Crear hogar"}
        </button>
      </form>
    </div>
  );
}
