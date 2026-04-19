
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
    const { data: invoices } = await supabase
      .from("invoices")
      .select("total,status,created_at");
    const { data: expenses } = await supabase
      .from("expenses")
      .select("amount,category,shipment_id,created_at");

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

    const categoryLabels = Object.keys(categoryData);
    const categoryValues = Object.values(categoryData);

    setExpenseCategoryChart({
      labels: categoryLabels,
      datasets: [
        {
          label: "Pengeluaran per Kategori",
          data: categoryValues,
          backgroundColor: [
            "#3b82f6",
            "#22c55e",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#14b8a6",
            "#6366f1",
            "#eab308"
          ],
          borderRadius: 8
        }
      ]
    });
  };

  const exportExcel = async () => {
    const { data: invoices } = await supabase
      .from("invoices")
      .select("total,status,created_at")
      .eq("status", "Paid");
    const { data: expenses } = await supabase
      .from("expenses")
      .select("category,description,amount,created_at")
      .order("created_at", { ascending: false });

    const summaryData = [
      { Keterangan: "Total Revenue", Nilai: summary.revenue },
      { Keterangan: "Total Expenses", Nilai: summary.expenses },
      { Keterangan: "Laba Bersih", Nilai: summary.profit }
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
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    const wsExpenses = XLSX.utils.json_to_sheet(detailExpenses);
    const wsInvoices = XLSX.utils.json_to_sheet(detailInvoices);
    
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsInvoices, "Revenue Detail");
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses Detail");
    
    XLSX.writeFile(wb, `Laporan_Keuangan_Layar_Timur_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            return "Rp " + context.raw.toLocaleString("id-ID");
          }
        }
      }
    },
    animation: { duration: 800 },
    scales: {
      y: { 
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#fff" }
      },
      x: { 
        grid: { display: false },
        ticks: { color: "#fff" }
      }
    }
  };

  if (loading) return <div className="loadingContainer">Loading...</div>;

  return (
    <div className="dashboardWrapper">
      <header className="header">
        <h1>🚛 Enterprise Dashboard</h1>
        <p className="loginInfo">
          <strong>Login:</strong> {userEmail}
        </p>
      </header>

      {/* NAVIGATION BUTTONS */}
      <nav className="navButtons">
        <button onClick={() => router.push("/dashboard/shipments")}>📦 Shipments</button>
        <button onClick={() => router.push("/dashboard/invoices")}>🧾 Invoices</button>
        <button onClick={() => router.push("/dashboard/payroll")}>💳 Payroll & Gaji</button>
        <button onClick={() => router.push("/dashboard/expenses/create")}>💸 Input Pengeluaran</button>
      </nav>

      {/* SUMMARY CARDS */}
      <section className="cardGrid">
        <Card title="Revenue" value={summary.revenue} />
        <Card title="Shipment Expense" value={expenseDetail.shipment} />
        <Card title="Gaji" value={expenseDetail.gaji} />
        <Card title="Lain-lain" value={expenseDetail.lain} />
        <Card title="Total Expenses" value={summary.expenses} />
        <Card title="Net Profit" value={summary.profit} highlight />
      </section>

      {/* PAYROLL QUICK ACCESS */}
      <section className="payrollWidget">
        <div className="widgetHeader">
          <div>
            <h3>Payroll & Slip Gaji</h3>
            <p>Manajemen penggajian karyawan otomatis.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/payroll/create')}
            className="btnAction"
          >
            Buat Slip Gaji Baru
          </button>
        </div>
      </section>

      {/* CHARTS SECTION */}
      <section className="chartsGrid">
        <div className="chartBox">
          <h3>Monthly Profit Trend</h3>
          <div className="chartWrapper">
            {monthlyChart && <Bar data={monthlyChart} options={chartOptions} />}
          </div>
        </div>
        <div className="chartBox">
          <h3>Expense Distribution</h3>
          <div className="chartWrapper">
            {expenseCategoryChart && <Bar data={expenseCategoryChart} options={chartOptions} />}
          </div>
        </div>
      </section>

      {/* FOOTER ACTIONS */}
      <footer className="footerActions">
        <button onClick={exportExcel} className="btnExport">
          📥 Export Excel Report
        </button>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="btnLogout"
        >
          Logout
        </button>
      </footer>

      <style jsx>{`
        .dashboardWrapper {
          padding: 20px;
          min-h-screen: 100vh;
          background: #0f172a;
          color: white;
          font-family: 'Public Sans', sans-serif;
        }
        @media (min-width: 768px) {
          .dashboardWrapper {
            padding: 40px;
          }
        }
        .header {
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 1.875rem;
          font-weight: 900;
          letter-spacing: -0.05em;
          margin: 0;
        }
        .loginInfo {
          opacity: 0.6;
          font-size: 0.875rem;
          margin-top: 5px;
        }
        .navButtons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }
        .navButtons button {
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .navButtons button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .cardGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .payrollWidget {
          background: rgba(255, 255, 255, 0.03);
          padding: 24px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 30px;
        }
        .widgetHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        .widgetHeader h3 {
          margin: 0;
          font-weight: 800;
        }
        .widgetHeader p {
          margin: 5px 0 0 0;
          font-size: 0.875rem;
          opacity: 0.5;
        }
        .btnAction {
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .btnAction:hover {
          background: #2563eb;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        .chartsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        .chartBox {
          background: rgba(255, 255, 255, 0.02);
          padding: 24px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .chartBox h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 20px;
          opacity: 0.8;
        }
        .chartWrapper {
          height: 300px;
          position: relative;
        }
        .footerActions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .btnExport {
          padding: 12px 24px;
          background: #22c55e;
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .btnExport:hover {
          background: #16a34a;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
        }
        .btnLogout {
          padding: 12px 24px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .btnLogout:hover {
          background: #ef4444;
          color: white;
        }
        .loadingContainer {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #0f172a;
          color: white;
        }
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
        .card {
          padding: 24px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.05);
        }
        .card.highlight {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border: none;
          box-shadow: 0 10px 30px rgba(22, 163, 74, 0.2);
        }
        h4 {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 10px 0;
          opacity: 0.5;
        }
        .highlight h4 {
          opacity: 0.8;
          color: white;
        }
        .value {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
