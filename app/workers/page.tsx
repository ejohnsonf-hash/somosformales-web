"use client";

import Link from "next/link";

export default function WorkersPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Trabajadoras del hogar</h1>

      <p>Aquí se listarán las trabajadoras.</p>

      <Link href="/workers/new">
        ➕ Registrar nueva trabajadora
      </Link>
    </div>
  );
}
