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
  const [menuOpen, setMenuOpen] = useState(false);
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
      .select("total,status")
      .eq("status", "Paid");
    const { data: expenses } = await supabase
      .from("expenses")
      .select("category,description,amount")
      .order("category", { ascending: true });

    const totalRevenue = invoices?.reduce((a, b) => a + Number(b.total), 0) || 0;
    const totalExpenses = expenses?.reduce((a, b) => a + Number(b.amount), 0) || 0;

    const summaryData = [
      { Keterangan: "Total Revenue", Nilai: totalRevenue },
      { Keterangan: "Total Expenses", Nilai: totalExpenses },
      { Keterangan: "Laba Bersih", Nilai: totalRevenue - totalExpenses }
    ];

    const detailExpenses = expenses.map(e => ({
      Category: e.category,
      Description: e.description,
      Amount: e.amount
    }));

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    const wsExpenses = XLSX.utils.json_to_sheet(detailExpenses);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses Detail");
    XLSX.writeFile(wb, "Laporan_Keuangan_Layar_Timur.xlsx");
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-[#0f172a] text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h2 className="font-bold tracking-tight">Layar Timur Admin</h2>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
          <span className="material-icons">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#0f172a] text-white transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 z-40 lg:h-screen p-6 flex flex-col`}>
          <div className="hidden lg:block mb-10">
            <h2 className="text-xl font-bold tracking-tighter">Layar Timur Express</h2>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Enterprise Admin Portal</p>
          </div>
          
          <nav className="space-y-2 flex-1">
            <NavItem icon="dashboard" label="Dashboard" active onClick={() => { router.push("/dashboard"); setMenuOpen(false); }} />
            <NavItem icon="inventory_2" label="Shipments" onClick={() => { router.push("/dashboard/shipments"); setMenuOpen(false); }} />
            <NavItem icon="receipt_long" label="Invoices" onClick={() => { router.push("/dashboard/invoices"); setMenuOpen(false); }} />
            <NavItem icon="payments" label="Payroll" onClick={() => { router.push("/dashboard/payroll"); setMenuOpen(false); }} />
            <NavItem icon="add_circle" label="Input Pengeluaran" onClick={() => { router.push("/dashboard/expenses/create"); setMenuOpen(false); }} />
          </nav>

          <div className="pt-6 border-t border-white/10">
            <p className="text-[10px] text-white/40 mb-4 truncate">{userEmail}</p>
            <button 
              onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
              className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons text-sm">logout</span> Logout
            </button>
          </div>
        </aside>

        {/* OVERLAY FOR MOBILE SIDEBAR */}
        {menuOpen && <div onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />}

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
          <header className="mb-10">
            <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Financial Overview</h1>
            <p className="text-slate-500 mt-1">Real-time logistics analytics and fiscal health summary.</p>
          </header>

          {/* SUMMARY CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <SummaryCard title="Revenue" value={summary.revenue} />
            <SummaryCard title="Total Expenses" value={summary.expenses} />
            <SummaryCard title="Net Profit" value={summary.profit} highlight />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* CHART 1 */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6">Monthly Profit Performance</h3>
              <div className="h-[300px]">
                {monthlyChart && <Bar data={monthlyChart} options={chartOptions} />}
              </div>
            </div>

            {/* CHART 2 */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6">Expense Distribution</h3>
              <div className="h-[300px]">
                {expenseCategoryChart && <Bar data={expenseCategoryChart} options={chartOptions} />}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={exportExcel}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons text-sm">download</span> Export XLSX Report
            </button>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
        @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;900&display=swap');
      `}</style>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
    >
      <span className="material-icons text-sm">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function SummaryCard({ title, value, highlight }) {
  return (
    <div className={`p-8 rounded-3xl border ${highlight ? 'bg-[#0f172a] text-white border-transparent shadow-2xl shadow-blue-900/40' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${highlight ? 'text-blue-400' : 'text-slate-400'}`}>{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold opacity-60">Rp</span>
        <h2 className="text-3xl font-black tracking-tighter truncate">
          {value.toLocaleString('id-ID')}
        </h2>
      </div>
    </div>
  );
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      padding: 12,
      backgroundColor: '#0f172a',
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 13 },
      callbacks: {
        label: (context) => "Rp " + context.raw.toLocaleString("id-ID")
      }
    }
  },
  scales: {
    y: { grid: { color: "#f1f5f9" }, ticks: { font: { family: 'Public Sans', size: 10 } } },
    x: { grid: { display: false }, ticks: { font: { family: 'Public Sans', size: 10 } } }
  }
};
