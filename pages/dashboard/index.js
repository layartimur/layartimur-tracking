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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0
  });

  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    checkSession();
    loadFinanceData();
  }, []);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/login");
    } else {
      setUserEmail(data.session.user.email);
      setLoading(false);
    }
  };

  const loadFinanceData = async () => {
    // =========================
    // LOAD REVENUE (PAID ONLY)
    // =========================
    const { data: invoices } = await supabase
      .from("invoices")
      .select("total,status");

    const paidInvoices =
      invoices?.filter(i => i.status === "Paid") || [];

    const revenue =
      paidInvoices.reduce(
        (acc, cur) => acc + Number(cur.total),
        0
      ) || 0;

    // =========================
    // LOAD EXPENSES
    // =========================
    const { data: expensesData } = await supabase
      .from("expenses")
      .select("amount");

    const expenses =
      expensesData?.reduce(
        (acc, cur) => acc + Number(cur.amount),
        0
      ) || 0;

    const profit = revenue - expenses;

    setSummary({ revenue, expenses, profit });

    setChartData({
      labels: ["Revenue", "Expenses", "Profit"],
      datasets: [
        {
          label: "Keuangan",
          data: [revenue, expenses, profit]
        }
      ]
    });
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard Admin</h1>
      <p>Admin system ready</p>

      <hr style={{ margin: "20px 0" }} />

      <p>
        <strong>Login sebagai:</strong> {userEmail}
      </p>

      <div style={{ marginTop: 30, display: "flex", gap: 20 }}>
        <button onClick={() => router.push("/dashboard/shipments")}>
          📦 Shipments
        </button>

        <button onClick={() => router.push("/dashboard/shipments/create")}>
          ➕ Create Shipment
        </button>

        <button onClick={() => router.push("/dashboard/invoices")}>
          🧾 Invoices
        </button>
      </div>

      {/* ===============================
           🔥 PRO FINANCE DASHBOARD
         =============================== */}

      <hr style={{ margin: "40px 0" }} />

      <h2>📊 Ringkasan Keuangan</h2>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <Card title="Total Revenue" value={summary.revenue} color="#0f172a" />
        <Card title="Total Expenses" value={summary.expenses} color="#7c2d12" />
        <Card title="Laba Bersih" value={summary.profit} color="#14532d" />
      </div>

      {chartData && (
        <div style={{ maxWidth: 600, marginTop: 40 }}>
          <Bar data={chartData} />
        </div>
      )}

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
        style={{
          marginTop: 40,
          padding: "10px 20px",
          backgroundColor: "#dc2626",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div
      style={{
        background: color,
        color: "#fff",
        padding: 20,
        flex: 1,
        borderRadius: 8
      }}
    >
      <h3>{title}</h3>
      <p>Rp {value.toLocaleString()}</p>
    </div>
  );
}