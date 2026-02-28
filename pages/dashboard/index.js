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
import * as XLSX from "xlsx"; // ✅ TAMBAHAN EXPORT EXCEL

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  const [summary, setSummary] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0
  });

  const [monthlyChart, setMonthlyChart] = useState(null);

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
      .select("amount,created_at");

    const paidInvoices =
      invoices?.filter(i => i.status === "Paid") || [];

    const revenue =
      paidInvoices.reduce((a, b) => a + Number(b.total), 0) || 0;

    const totalExpenses =
      expenses?.reduce((a, b) => a + Number(b.amount), 0) || 0;

    const profit = revenue - totalExpenses;

    setSummary({ revenue, expenses: totalExpenses, profit });

    // ===========================
    // PROFIT PER BULAN
    // ===========================
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

    setMonthlyChart({
      labels,
      datasets: [
        {
          label: "Profit per Bulan",
          data: profitValues
        }
      ]
    });
  };

  // ===========================
  // 🔥 EXPORT EXCEL ENTERPRISE
  // ===========================
  const exportExcel = async () => {
    const { data: invoices } = await supabase
      .from("invoices")
      .select("invoice_number,total,status,created_at")
      .eq("status", "Paid");

    const { data: expenses } = await supabase
      .from("expenses")
      .select("description,amount,created_at");

    const revenue =
      invoices?.reduce((a, b) => a + Number(b.total), 0) || 0;

    const totalExpenses =
      expenses?.reduce((a, b) => a + Number(b.amount), 0) || 0;

    const profit = revenue - totalExpenses;

    const summarySheet = [
      { Keterangan: "Total Revenue", Nilai: revenue },
      { Keterangan: "Total Expenses", Nilai: totalExpenses },
      { Keterangan: "Laba Bersih", Nilai: profit }
    ];

    const monthlyData = {};

    invoices?.forEach(inv => {
      const month = inv.created_at.slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = 0;
      monthlyData[month] += Number(inv.total);
    });

    expenses?.forEach(exp => {
      const month = exp.created_at.slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = 0;
      monthlyData[month] -= Number(exp.amount);
    });

    const monthlySheet = Object.keys(monthlyData).map(month => ({
      Bulan: month,
      Profit: monthlyData[month]
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(summarySheet),
      "Summary"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(monthlySheet),
      "Profit per Bulan"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(invoices || []),
      "Invoices Paid"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(expenses || []),
      "Expenses"
    );

    XLSX.writeFile(workbook, "Laporan_Keuangan_Layar_Timur.xlsx");
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>🚛 Enterprise Dashboard</h1>
      <p><strong>Login:</strong> {userEmail}</p>

      <div className="navButtons">
        <button onClick={() => router.push("/dashboard/shipments")}>
          📦 Shipments
        </button>
        <button onClick={() => router.push("/dashboard/invoices")}>
          🧾 Invoices
        </button>
      </div>
<button onClick={() => router.push("/dashboard/expenses/create")}>
  💸 Input Pengeluaran
</button>

      <div className="cardContainer">
        <Card title="Revenue" value={summary.revenue} />
        <Card title="Expenses" value={summary.expenses} />
        <Card title="Profit" value={summary.profit} highlight />
      </div>

      <div className="chartContainer">
        {monthlyChart && <Bar data={monthlyChart} />}
      </div>

      {/* ✅ TOMBOL EXPORT EXCEL */}
      <button
        onClick={exportExcel}
        style={{
          marginTop: 20,
          padding: "10px 15px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        📥 Export Excel Report
      </button>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
        className="logoutBtn"
      >
        Logout
      </button>

      <style jsx>{`
        .navButtons {
          margin-top: 20px;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        button {
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          background: #0f172a;
          color: white;
        }

        .cardContainer {
          display: flex;
          gap: 20px;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .chartContainer {
          margin-top: 40px;
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }

        .logoutBtn {
          margin-top: 40px;
          background: #dc2626;
        }

        @media (max-width: 768px) {
          .cardContainer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

function Card({ title, value, highlight }) {
  return (
    <div
      style={{
        flex: 1,
        padding: 20,
        borderRadius: 10,
        background: highlight ? "#16a34a" : "#0f172a",
        color: "white"
      }}
    >
      <h3>{title}</h3>
      <h2>Rp {value.toLocaleString()}</h2>
    </div>
  );
}