import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";

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

  // ===== INSERT / UPDATE DATA =====
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

  // ===== EXPORT EXCEL =====
  const handleExport = async () => {
    const { data, error } = await supabase
      .from("PENGIRIMAN")
      .select("*");

    if (error) {
      alert("Gagal mengambil data");
      return;
    }

    const formattedData = data.map(item => ({
      "Tracking Number": item.tracking_number,
      "Nama Pelanggan": item.nama_pelanggan,
      "Status Pengiriman": item.status_pengiriman,
      "Tanggal Sampai": item.tanggal_sampai,
      "Status Pembayaran": item.status_pembayaran,
      "Nomor Surat Jalan": item.nomor_surat_jalan,
      "Tanggal Surat Jalan": item.tgl_surat_jalan,
      "Berat": item.berat,
      "Alamat": item.alamat,
      "No Telpon": item.no_telpon,
      "Nama Barang": item.nama_barang,
      "Jumlah Barang": item.jumlah_barang
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tracking");

    XLSX.writeFile(workbook, "Data_Tracking_Layar_Timur.xlsx");
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

        <button
          onClick={handleExport}
          style={{ marginTop: 10, background: "#16a34a" }}
        >
          Export Excel
        </button>

      </div>
    </div>
  );
}