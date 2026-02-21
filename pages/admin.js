import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Admin() {
  const router = useRouter();

  // ===== FORM STATE =====
  const [tracking, setTracking] = useState("");
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("Diproses");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [statusPembayaran, setStatusPembayaran] = useState("Belum Lunas");
  const [totalHarga, setTotalHarga] = useState("");

  // ===== DASHBOARD STATE =====
  const [summary, setSummary] = useState({
    totalResi: 0,
    totalLunas: 0,
    totalPending: 0,
    totalOmzet: 0,
  });

  const [chartStatus, setChartStatus] = useState(null);
  const [chartPembayaran, setChartPembayaran] = useState(null);
  const [chartBulanan, setChartBulanan] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [startDate, endDate]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/login");
    }
  };

  // ===== INSERT / UPDATE =====
  const handleInsert = async () => {
    const { error } = await supabase
      .from("PENGIRIMAN")
      .upsert(
        [{
          tracking_number: tracking,
          nama_pelanggan: nama,
          status_pengiriman: status,
          tanggal_sampai: tanggalSampai || null,
          status_pembayaran: statusPembayaran,
          total_harga: totalHarga || 0
        }],
        { onConflict: "tracking_number" }
      );

    if (error) {
      alert(error.message);
    } else {
      alert("Data berhasil disimpan");
      loadDashboard();
    }
  };

  // ===== LOAD DASHBOARD =====
  const loadDashboard = async () => {
    let query = supabase.from("PENGIRIMAN").select("*");

    if (startDate && endDate) {
      query = query
        .gte("tgl_surat_jalan", startDate)
        .lte("tgl_surat_jalan", endDate);
    }

    const { data, error } = await query;
    if (error) return;

    const totalResi = data.length;
    const totalLunas = data.filter(d => d.status_pembayaran === "Lunas").length;
    const totalPending = data.filter(d => d.status_pembayaran === "Belum Lunas").length;
    const totalOmzet = data
      .filter(d => d.status_pembayaran === "Lunas")
      .reduce((acc, curr) => acc + (Number(curr.total_harga) || 0), 0);

    setSummary({ totalResi, totalLunas, totalPending, totalOmzet });

    const diproses = data.filter(d => d.status_pengiriman === "Diproses").length;
    const dikirim = data.filter(d => d.status_pengiriman === "Dikirim").length;
    const sampai = data.filter(d => d.status_pengiriman === "Sampai").length;

    setChartStatus({
      labels: ["Diproses", "Dikirim", "Sampai"],
      datasets: [{
        data: [diproses, dikirim, sampai],
        backgroundColor: ["#f59e0b", "#3b82f6", "#16a34a"]
      }]
    });

    setChartPembayaran({
      labels: ["Lunas", "Belum Lunas"],
      datasets: [{
        data: [totalLunas, totalPending],
        backgroundColor: ["#16a34a", "#ef4444"]
      }]
    });

    const monthly = {};
    data.forEach(item => {
      const month = item.tgl_surat_jalan?.substring(0, 7);
      if (!monthly[month]) monthly[month] = 0;
      monthly[month]++;
    });

    setChartBulanan({
      labels: Object.keys(monthly),
      datasets: [{
        label: "Pengiriman per Bulan",
        data: Object.values(monthly),
        backgroundColor: "#6366f1"
      }]
    });
  };

  // ===== EXPORT EXCEL =====
  const handleExport = async () => {
    const { data } = await supabase.from("PENGIRIMAN").select("*");
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tracking");
    XLSX.writeFile(workbook, "Data_Tracking.xlsx");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Dashboard Admin PRO</h2>

        {/* FILTER */}
        <div style={{ marginBottom: 20 }}>
          <input type="date" onChange={(e)=>setStartDate(e.target.value)} />
          <input type="date" onChange={(e)=>setEndDate(e.target.value)} />
        </div>

        {/* SUMMARY */}
        <div style={{ display:"flex", gap:20 }}>
          <div>Total Resi: {summary.totalResi}</div>
          <div>Total Lunas: {summary.totalLunas}</div>
          <div>Total Pending: {summary.totalPending}</div>
          <div>Total Omzet: Rp {summary.totalOmzet.toLocaleString()}</div>
        </div>

        <hr style={{ margin:"30px 0" }}/>

        {/* FORM INPUT */}
        <input placeholder="Tracking" onChange={(e)=>setTracking(e.target.value)} />
        <input placeholder="Nama" onChange={(e)=>setNama(e.target.value)} />
        <input type="number" placeholder="Total Harga" onChange={(e)=>setTotalHarga(e.target.value)} />
        <select onChange={(e)=>setStatus(e.target.value)}>
          <option>Diproses</option>
          <option>Dikirim</option>
          <option>Sampai</option>
        </select>
        <input type="date" onChange={(e)=>setTanggalSampai(e.target.value)} />
        <select onChange={(e)=>setStatusPembayaran(e.target.value)}>
          <option>Belum Lunas</option>
          <option>Lunas</option>
        </select>

        <button onClick={handleInsert}>Simpan</button>
        <button onClick={handleExport}>Export Excel</button>

        <hr style={{ margin:"30px 0" }}/>

        {chartStatus && <Bar data={chartStatus} />}
        {chartPembayaran && <Doughnut data={chartPembayaran} />}
        {chartBulanan && <Bar data={chartBulanan} />}
      </div>
    </div>
  );
}