"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div>
      <h1>Home</h1>

      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
        <button onClick={() => router.push("/households")}>
          Hogares
        </button>

        <button onClick={() => router.push("/workers")}>
          Trabajadoras
        </button>
      </div>
    </div>
  );
}
