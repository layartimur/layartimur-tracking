
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  
  // DATE FILTER STATE
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [summary, setSummary] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0
  });
  const [expenseDetail, setExpenseDetail] = useState({
    shipment: 0,
    gaji: 0,
    lain: 0
  });
  const [monthlyChart, setMonthlyChart] = useState(null);
  const [expenseCategoryChart, setExpenseCategoryChart] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    if (userEmail) {
      loadFinanceData();
    }
  }, [startDate, endDate]);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/login");
    } else {
      setUserEmail(data.session.user.email);
      loadFinanceData();
      setLoading(false);
    }
  };

  const loadFinanceData = async () => {
    let invoiceQuery = supabase.from("invoices").select("total,status,created_at");
    let expenseQuery = supabase.from("expenses").select("amount,category,shipment_id,created_at");

    // Apply Filters to Queries if dates are set
    if (startDate) {
      invoiceQuery = invoiceQuery.gte("created_at", `${startDate}T00:00:00`);
      expenseQuery = expenseQuery.gte("created_at", `${startDate}T00:00:00`);
    }
    if (endDate) {
      invoiceQuery = invoiceQuery.lte("created_at", `${endDate}T23:59:59`);
      expenseQuery = expenseQuery.lte("created_at", `${endDate}T23:59:59`);
    }

    const { data: invoices } = await invoiceQuery;
    const { data: expenses } = await expenseQuery;

    const paidInvoices = invoices?.filter(i => i.status === "Paid") || [];
    const revenue = paidInvoices.reduce((a, b) => a + Number(b.total), 0) || 0;

    const shipmentExpenses = expenses?.filter(e => e.shipment_id !== null)
      .reduce((a, b) => a + Number(b.amount), 0) || 0;

    const gajiExpenses = expenses?.filter(e => e.category?.toLowerCase().includes("gaji"))
      .reduce((a, b) => a + Number(b.amount), 0) || 0;

    const otherExpenses = expenses?.filter(e =>
      e.shipment_id === null &&
      !e.category?.toLowerCase().includes("gaji")
    )
      .reduce((a, b) => a + Number(b.amount), 0) || 0;

    const totalExpenses = shipmentExpenses + gajiExpenses + otherExpenses;
    const profit = revenue - totalExpenses;

    setSummary({
      revenue,
      expenses: totalExpenses,
      profit
    });
    setExpenseDetail({
      shipment: shipmentExpenses,
      gaji: gajiExpenses,
      lain: otherExpenses
    });

    // Chart Data Processing
    const monthlyData = {};
    paidInvoices.forEach(inv => {
      const month = inv.created_at.slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
      monthlyData[month].revenue += Number(inv.total);
    });
    expenses?.forEach(exp => {
      const month = exp.created_at.slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
      monthlyData[month].expenses += Number(exp.amount);
    });

    const labels = Object.keys(monthlyData).sort();
    const profitValues = labels.map(
      m => monthlyData[m].revenue - monthlyData[m].expenses
    );
    const profitColors = profitValues.map(v =>
      v >= 0 ? "#22c55e" : "#ef4444"
    );

    setMonthlyChart({
      labels,
      datasets: [
        {
          label: "Profit per Bulan",
          data: profitValues,
          backgroundColor: profitColors,
          borderRadius: 8
        }
      ]
    });

    const categoryData = {};
    expenses?.forEach(exp => {
      const kategori = exp.category || "Tidak ada kategori";
      if (!categoryData[kategori]) {
        categoryData[kategori] = 0;
      }
      categoryData[kategori] += Number(exp.amount);
    });

    setExpenseCategoryChart({
      labels: Object.keys(categoryData),
      datasets: [
        {
          label: "Pengeluaran per Kategori",
          data: Object.values(categoryData),
          backgroundColor: [
            "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#6366f1", "#eab308"
          ],
          borderRadius: 8
        }
      ]
    });
  };

  const exportExcel = async () => {
    let invQ = supabase.from("invoices").select("total,status,created_at").eq("status", "Paid");
    let expQ = supabase.from("expenses").select("category,description,amount,created_at");

    if (startDate) {
      invQ = invQ.gte("created_at", `${startDate}T00:00:00`);
      expQ = expQ.gte("created_at", `${startDate}T00:00:00`);
    }
    if (endDate) {
      invQ = invQ.lte("created_at", `${endDate}T23:59:59`);
      expQ = expQ.lte("created_at", `${endDate}T23:59:59`);
    }

    const { data: invoices } = await invQ;
    const { data: expenses } = await expQ;

    const totalRevenue = invoices?.reduce((a, b) => a + Number(b.total), 0) || 0;
    const totalExpenses = expenses?.reduce((a, b) => a + Number(b.amount), 0) || 0;

    const summaryData = [
      { Keterangan: "Total Revenue", Nilai: totalRevenue },
      { Keterangan: "Total Expenses", Nilai: totalExpenses },
      { Keterangan: "Laba Bersih", Nilai: totalRevenue - totalExpenses }
    ];

    const detailExpenses = expenses.map(e => ({
      'Tanggal Input': new Date(e.created_at).toLocaleDateString('id-ID'),
      'Kategori': e.category,
      'Keterangan': e.description,
      'Jumlah': e.amount
    }));

    const detailInvoices = invoices.map(i => ({
        'Tanggal Input': new Date(i.created_at).toLocaleDateString('id-ID'),
        'Status': i.status,
        'Total': i.total
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailInvoices), "Revenue Detail");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailExpenses), "Expenses Detail");
    
    const filterText = startDate && endDate ? `_${startDate}_to_${endDate}` : "";
    XLSX.writeFile(wb, `Laporan_Keuangan_Layar_Timur${filterText}.xlsx`);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c) => "Rp " + c.raw.toLocaleString("id-ID") } }
    },
    scales: {
      y: { grid: { color: "rgba(255, 255, 255, 0.1)" }, ticks: { color: "#fff" } },
      x: { grid: { display: false }, ticks: { color: "#fff" } }
    }
  };

  if (loading) return <div className="loadingContainer">Loading...</div>;

  return (
    <div className="dashboardWrapper">
      <header className="header">
        <h1>🚛 Enterprise Dashboard</h1>
        <p className="loginInfo"><strong>Login:</strong> {userEmail}</p>
      </header>

      {/* DATE FILTER UI */}
      <div className="filterSection">
        <div className="filterGroup">
          <label>Dari Tanggal</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="filterGroup">
          <label>Sampai Tanggal</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button className="btnReset" onClick={() => { setStartDate(""); setEndDate(""); }}>Reset Filter</button>
      </div>

      <nav className="navButtons">
        <button onClick={() => router.push("/dashboard/shipments")}>📦 Shipments</button>
        <button onClick={() => router.push("/dashboard/invoices")}>🧾 Invoices</button>
        <button onClick={() => router.push("/dashboard/payroll")}>💳 Payroll & Gaji</button>
        <button onClick={() => router.push("/dashboard/expenses/create")}>💸 Input Pengeluaran</button>
      </nav>

      <section className="cardGrid">
        <Card title="Revenue" value={summary.revenue} />
        <Card title="Shipment Expense" value={expenseDetail.shipment} />
        <Card title="Gaji" value={expenseDetail.gaji} />
        <Card title="Lain-lain" value={expenseDetail.lain} />
        <Card title="Total Expenses" value={summary.expenses} />
        <Card title="Net Profit" value={summary.profit} highlight />
      </section>

      <section className="chartsGrid">
        <div className="chartBox">
          <h3>Filtered Profit Trend</h3>
          <div className="chartWrapper">{monthlyChart && <Bar data={monthlyChart} options={chartOptions} />}</div>
        </div>
        <div className="chartBox">
          <h3>Expense Distribution</h3>
          <div className="chartWrapper">{expenseCategoryChart && <Bar data={expenseCategoryChart} options={chartOptions} />}</div>
        </div>
      </section>

      <footer className="footerActions">
        <button onClick={exportExcel} className="btnExport">📥 Export Filtered XLSX Report</button>
        <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="btnLogout">Logout</button>
      </footer>

      <style jsx>{`
        .dashboardWrapper { padding: 20px; min-height: 100vh; background: #0f172a; color: white; font-family: 'Public Sans', sans-serif; }
        @media (min-width: 768px) { .dashboardWrapper { padding: 40px; } }
        .header { margin-bottom: 30px; }
        .header h1 { font-size: 1.875rem; font-weight: 900; letter-spacing: -0.05em; margin: 0; }
        .loginInfo { opacity: 0.6; font-size: 0.875rem; margin-top: 5px; }
        
        .filterSection { display: flex; gap: 20px; align-items: flex-end; margin-bottom: 30px; flex-wrap: wrap; background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .filterGroup { display: flex; flexDirection: column; gap: 8px; }
        .filterGroup label { font-size: 10px; font-weight: 800; text-transform: uppercase; opacity: 0.5; }
        .filterGroup input { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 10px; borderRadius: 10px; outline: none; }
        .btnReset { padding: 10px 15px; background: rgba(255,255,255,0.05); color: white; border: none; borderRadius: 10px; cursor: pointer; font-size: 12px; font-weight: 700; transition: 0.2s; }
        .btnReset:hover { background: rgba(255,255,255,0.1); }

        .navButtons { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 30px; }
        .navButtons button { padding: 10px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white; cursor: pointer; font-weight: 600; font-size: 0.875rem; transition: all 0.2s; }
        .navButtons button:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }
        
        .cardGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .chartsGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-bottom: 40px; }
        .chartBox { background: rgba(255, 255, 255, 0.02); padding: 24px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.05); }
        .chartBox h3 { font-size: 1rem; font-weight: 700; margin-bottom: 20px; opacity: 0.8; }
        .chartWrapper { height: 300px; position: relative; }
        
        .footerActions { display: flex; gap: 15px; flex-wrap: wrap; }
        .btnExport { padding: 12px 24px; background: #22c55e; color: white; border: none; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btnExport:hover { background: #16a34a; box-shadow: 0 0 20px rgba(34, 197, 94, 0.2); }
        .btnLogout { padding: 12px 24px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 14px; font-weight: 700; cursor: pointer; }
        .btnLogout:hover { background: #ef4444; color: white; }
        
        .loadingContainer { display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: white; }
      `}</style>
    </div>
  );
}

function Card({ title, value, highlight }) {
  return (
    <div className={`card ${highlight ? 'highlight' : ''}`}>
      <h4>{title}</h4>
      <p className="value">Rp {value.toLocaleString('id-ID')}</p>
      <style jsx>{`
        .card { padding: 24px; border-radius: 24px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); transition: transform 0.2s; }
        .card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.05); }
        .card.highlight { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border: none; box-shadow: 0 10px 30px rgba(22, 163, 74, 0.2); }
        h4 { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px 0; opacity: 0.5; }
        .highlight h4 { opacity: 0.8; color: white; }
        .value { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.02em; margin: 0; }
      `}</style>
    </div>
  );
}
