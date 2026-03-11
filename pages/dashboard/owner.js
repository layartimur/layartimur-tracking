import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
ResponsiveContainer,
BarChart,
Bar,
Legend
} from "recharts";

export default function OwnerDashboard() {

const router = useRouter();

const [stats, setStats] = useState({
totalShipment: 0,
totalRevenue: 0,
totalExpense: 0,
netProfit: 0,
paidInvoice: 0,
unpaidInvoice: 0
});

const [chartData, setChartData] = useState([]);
const [expenseData, setExpenseData] = useState([]);
const [shipmentProfit,setShipmentProfit] = useState([]);

const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

const [loading, setLoading] = useState(true);

// 🔐 Protect Route
useEffect(() => {

const checkUser = async () => {

const { data } = await supabase.auth.getUser();

if (!data?.user) {
router.push("/owner-login");
}

};

checkUser();

}, []);

useEffect(() => {
loadDashboard();
}, [fromDate, toDate]);

const handleLogout = async () => {
await supabase.auth.signOut();
router.push("/owner-login");
};

const loadDashboard = async () => {

setLoading(true);

let invoiceQuery = supabase
.from("invoices")
.select("total, status, created_at, shipment_id");

let expenseQuery = supabase
.from("expenses")
.select("amount, category, shipment_id, created_at");

if (fromDate) {
invoiceQuery = invoiceQuery.gte("created_at", fromDate);
expenseQuery = expenseQuery.gte("created_at", fromDate);
}

if (toDate) {
invoiceQuery = invoiceQuery.lte("created_at", toDate);
expenseQuery = expenseQuery.lte("created_at", toDate);
}

const { data: shipments } = await supabase
.from("shipments")
.select("id, tracking_number");

const { data: invoices } = await invoiceQuery;
const { data: expenses } = await expenseQuery;

// =========================
// SUMMARY
// =========================

const totalShipment = shipments?.length || 0;

const totalRevenue =
invoices?.reduce((acc, inv) =>
acc + Number(inv.total || 0), 0) || 0;

const paidInvoice =
invoices?.filter(i => i.status === "Paid").length || 0;

const unpaidInvoice =
invoices?.filter(i => i.status === "Unpaid").length || 0;

const totalExpense =
expenses?.reduce((acc, exp) =>
acc + Number(exp.amount || 0), 0) || 0;

const netProfit = totalRevenue - totalExpense;

// =========================
// REVENUE / EXPENSE PER MONTH
// =========================

const revenueByMonth = {};

invoices?.forEach(inv => {

const month = new Date(inv.created_at)
.toLocaleString("default", { month: "short", year: "numeric" });

revenueByMonth[month] =
(revenueByMonth[month] || 0) + Number(inv.total || 0);

});

const expenseByMonth = {};

expenses?.forEach(exp => {

const month = new Date(exp.created_at)
.toLocaleString("default", { month: "short", year: "numeric" });

expenseByMonth[month] =
(expenseByMonth[month] || 0) + Number(exp.amount || 0);

});

const mergedMonths = Object.keys({
...revenueByMonth,
...expenseByMonth
});

const finalChartData = mergedMonths.map(month => ({
month,
revenue: revenueByMonth[month] || 0,
expense: expenseByMonth[month] || 0,
profit:
(revenueByMonth[month] || 0) -
(expenseByMonth[month] || 0)
}));

// =========================
// EXPENSE PER CATEGORY
// =========================

const expenseCategory = {};

expenses?.forEach(exp => {

const cat = exp.category || "Lainnya";

expenseCategory[cat] =
(expenseCategory[cat] || 0) +
Number(exp.amount || 0);

});

const expenseCategoryData =
Object.keys(expenseCategory).map(key => ({
category: key,
total: expenseCategory[key]
}));

// =========================
// PROFIT PER SHIPMENT
// =========================

const shipmentMap = {};

invoices?.forEach(inv => {

if (!inv.shipment_id) return;

shipmentMap[inv.shipment_id] =
shipmentMap[inv.shipment_id] || { revenue: 0, expense: 0 };

shipmentMap[inv.shipment_id].revenue +=
Number(inv.total || 0);

});

expenses?.forEach(exp => {

if (!exp.shipment_id) return;

shipmentMap[exp.shipment_id] =
shipmentMap[exp.shipment_id] || { revenue: 0, expense: 0 };

shipmentMap[exp.shipment_id].expense +=
Number(exp.amount || 0);

});

const shipmentProfitData =
Object.keys(shipmentMap).map(id => {

const ship = shipments?.find(s => s.id === id);

const revenue = shipmentMap[id].revenue;
const expense = shipmentMap[id].expense;

return {
shipment: ship?.tracking_number || id,
revenue,
expense,
profit: revenue - expense
};

});

// =========================
// SET STATE
// =========================

setStats({
totalShipment,
totalRevenue,
totalExpense,
netProfit,
paidInvoice,
unpaidInvoice
});

setChartData(finalChartData);
setExpenseData(expenseCategoryData);
setShipmentProfit(shipmentProfitData);

setLoading(false);

};

if (loading)
return <div style={{ padding: 40 }}>Loading dashboard...</div>;

return (

<div style={{ padding: 40 }}>

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}>

<h1>Owner Executive Dashboard</h1>

<button
onClick={handleLogout}
style={{
background:"#dc2626",
color:"white",
padding:"8px 15px",
border:"none",
cursor:"pointer",
borderRadius:6
}}

>

Logout </button>

</div>

{/* DATE FILTER */}

<div style={{ marginTop:20, marginBottom:30 }}>

<input
type="date"
value={fromDate}
onChange={(e)=>setFromDate(e.target.value)}
/>

<input
type="date"
value={toDate}
onChange={(e)=>setToDate(e.target.value)}
style={{ marginLeft:10 }}
/>

</div>

{/* SUMMARY CARDS */}

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:20
}}>

<Card title="Total Shipment" value={stats.totalShipment} />

<Card
title="Revenue"
value={`Rp ${stats.totalRevenue.toLocaleString()}`}
/>

<Card
title="Expense"
value={`Rp ${stats.totalExpense.toLocaleString()}`}
/>

<Card
title="Net Profit"
value={`Rp ${stats.netProfit.toLocaleString()}`}
highlight
/>

<Card title="Paid Invoice" value={stats.paidInvoice} />
<Card title="Unpaid Invoice" value={stats.unpaidInvoice} />

</div>

{/* REVENUE PROFIT CHART */}

<h2 style={{ marginTop:50 }}>Revenue & Profit Chart</h2>

<ResponsiveContainer width="100%" height={300}>

<LineChart data={chartData}>

<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="month" />
<YAxis />
<Tooltip />
<Legend />

<Line type="monotone" dataKey="revenue" stroke="#2563eb"/>
<Line type="monotone" dataKey="expense" stroke="#dc2626"/>
<Line type="monotone" dataKey="profit" stroke="#16a34a"/>

</LineChart>

</ResponsiveContainer>

{/* EXPENSE CATEGORY */}

<h2 style={{ marginTop:50 }}>Expense Breakdown</h2>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={expenseData}>

<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="category"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="total" fill="#0f172a"/>

</BarChart>

</ResponsiveContainer>

{/* PROFIT PER SHIPMENT */}

<h2 style={{ marginTop:50 }}>Profit per Shipment</h2>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={shipmentProfit}>

<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="shipment"/>
<YAxis/>
<Tooltip/>
<Legend/>

<Bar dataKey="revenue" fill="#2563eb"/>
<Bar dataKey="expense" fill="#dc2626"/>
<Bar dataKey="profit" fill="#16a34a"/>

</BarChart>

</ResponsiveContainer>

</div>

);

}

function Card({ title, value, highlight }) {

return (

<div style={{
padding:25,
borderRadius:15,
background: highlight ? "#0f172a" : "#1e293b",
color:"white",
boxShadow:"0 10px 25px rgba(0,0,0,0.2)"
}}>

<h3>{title}</h3>
<h2>{value}</h2>

</div>

);

}
