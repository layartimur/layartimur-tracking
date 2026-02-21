import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Admin() {
  const router = useRouter();
  const [tracking, setTracking] = useState("");
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("Diproses");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/login");
    }
  };

  const handleInsert = async () => {
    await supabase.from("PENGIRIMAN").insert([
      {
        tracking_number: tracking,
        nama_pelanggan: nama,
        status_pengiriman: status,
      },
    ]);

    alert("Data berhasil ditambahkan");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Dashboard Admin</h2>

        <input
          placeholder="Tracking Number"
          onChange={(e) => setTracking(e.target.value)}
        />

        <input
          placeholder="Nama Pelanggan"
          onChange={(e) => setNama(e.target.value)}
        />

        <select onChange={(e) => setStatus(e.target.value)}>
          <option>Diproses</option>
          <option>Dikirim</option>
          <option>Sampai</option>
        </select>

        <button onClick={handleInsert}>Tambah Resi</button>
      </div>
    </div>
  );
}