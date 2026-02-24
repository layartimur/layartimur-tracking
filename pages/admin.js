import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Bar = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Bar),
  { ssr: false }
);

const Doughnut = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Doughnut),
  { ssr: false }
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Admin() {
  const router = useRouter();

  // ================= STATE =================
  const [tracking, setTracking] = useState("");
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("Diproses");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [statusPembayaran, setStatusPembayaran] = useState("Belum Lunas");
  const [totalHarga, setTotalHarga] = useState("");

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

  // ================= AUTH =================
  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [startDate, endDate]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  };

  // ================= INSERT =================
  const handleInsert = async () => {
    if (!tracking || !nama) {
      alert("Tracking dan Nama wajib diisi");
      return;
    }

    const { error } = await supabase
      .from("PENGIRIMAN")
      .upsert(
        [{
          tracking_number: tracking.trim(),
          nama_pelanggan: nama,
          status_pengiriman: status,
          tanggal_sampai: tanggalSampai || null,
          status_pembayaran: statusPembayaran,
          total_harga: Number(totalHarga) || 0
        }],
        { onConflict: "tracking_number" }
      );

    if (error) {
      alert(error.message);
    } else {
      alert("Data berhasil disimpan / diupdate");
      resetForm();
      loadDashboard();
    }
  };

  const resetForm = () => {
    setTracking("");
    setNama("");
    setStatus("Diproses");
    setTanggalSampai("");
    setStatusPembayaran("Belum Lunas");
    setTotalHarga("");
  };

  // ================= LOAD =================
  const loadDashboard = async () => {
    let query = supabase.from("PENGIRIMAN").select("*");

    if (startDate && endDate) {
      query = query
        .gte("tgl_surat_jalan", startDate)
        .lte("tgl_surat_jalan", endDate);
    }

    const { data, error } = await query;
    if (error || !data) return;

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
      if (!month) return;
      monthly[month] = (monthly[month] || 0) + 1;
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

  // ================= EXPORT =================
  const handleExport = async () => {
    const { data } = await supabase.from("PENGIRIMAN").select("*");
    const worksheet = XLSX.utils.json_to_sheet(data || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tracking");
    XLSX.writeFile(workbook, "Data_Tracking_Layar_Timur.xlsx");
  };

  // ================= UI =================
  return (
    <div className="adminWrapper">
      <div className="adminContainer">

        <h1 className="adminTitle">Dashboard Admin PRO</h1>

        {/* FILTER */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:30 }}>
          <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
        </div>

        {/* SUMMARY */}
        <div className="adminStats">
          <div className="statCard">
            <h3>Total Resi</h3>
            <p>{summary.totalResi}</p>
          </div>
          <div className="statCard">
            <h3>Total Lunas</h3>
            <p>{summary.totalLunas}</p>
          </div>
          <div className="statCard">
            <h3>Total Pending</h3>
            <p>{summary.totalPending}</p>
          </div>
          <div className="statCard">
            <h3>Total Omzet</h3>
            <p>Rp {summary.totalOmzet.toLocaleString()}</p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="adminCharts">
          {chartStatus && (
            <div className="chartCard">
              <Bar data={chartStatus} />
            </div>
          )}

          {chartPembayaran && (
            <div className="chartCard">
              <Doughnut data={chartPembayaran} />
            </div>
          )}

          {chartBulanan && (
            <div className="chartCard">
              <Bar data={chartBulanan} />
            </div>
          )}
        </div>

        {/* FORM */}
        <div className="adminTableWrapper">
          <h3 style={{ marginBottom:20 }}>Input / Update Data</h3>

          <div style={{ display:"grid", gap:10 }}>
            <input value={tracking} placeholder="Tracking" onChange={(e)=>setTracking(e.target.value)} />
            <input value={nama} placeholder="Nama Pelanggan" onChange={(e)=>setNama(e.target.value)} />
            <input value={totalHarga} type="number" placeholder="Total Harga" onChange={(e)=>setTotalHarga(e.target.value)} />

            <select value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option>Diproses</option>
              <option>Dikirim</option>
              <option>Sampai</option>
            </select>

            <input type="date" value={tanggalSampai} onChange={(e)=>setTanggalSampai(e.target.value)} />

            <select value={statusPembayaran} onChange={(e)=>setStatusPembayaran(e.target.value)}>
              <option>Belum Lunas</option>
              <option>Lunas</option>
            </select>

            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <button onClick={handleInsert}>Simpan Data</button>
              <button onClick={handleExport}>Export Excel</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}