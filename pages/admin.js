import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Admin() {
  const router = useRouter();

  // ===== STATE =====
  const [tracking, setTracking] = useState("");
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("Diproses");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [statusPembayaran, setStatusPembayaran] = useState("Belum Lunas");

  // ===== CEK LOGIN =====
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/login");
    }
  };

  // ===== INSERT DATA =====
  const handleInsert = async () => {
  if (!tracking || !nama) {
    alert("Tracking dan Nama wajib diisi");
    return;
  }

  const { error } = await supabase
    .from("PENGIRIMAN")
    .upsert(
      [{
        tracking_number: tracking,
        nama_pelanggan: nama,
        status_pengiriman: status,
        tanggal_sampai: tanggalSampai || null,
        status_pembayaran: statusPembayaran
      }],
      { onConflict: "tracking_number" }
    );

  if (error) {
    console.log(error);
    alert(error.message);
  } else {
    alert("Data berhasil disimpan / diupdate");

    setTracking("");
    setNama("");
    setStatus("Diproses");
    setTanggalSampai("");
    setStatusPembayaran("Belum Lunas");
  }
};

  return (
    <div className="container">
      <div className="card">
        <h2>Dashboard Admin</h2>

        <input
          type="text"
          placeholder="Tracking Number"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
        />

        <input
          type="text"
          placeholder="Nama Pelanggan"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Diproses">Diproses</option>
          <option value="Dikirim">Dikirim</option>
          <option value="Sampai">Sampai</option>
        </select>

        <input
          type="date"
          value={tanggalSampai}
          onChange={(e) => setTanggalSampai(e.target.value)}
        />

        <select
          value={statusPembayaran}
          onChange={(e) => setStatusPembayaran(e.target.value)}
        >
          <option value="Belum Lunas">Belum Lunas</option>
          <option value="Lunas">Lunas</option>
        </select>

        <button onClick={handleInsert}>
          Simpan Data
        </button>
      </div>
    </div>
  );
}