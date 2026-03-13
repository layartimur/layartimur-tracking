import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import * as XLSX from "xlsx";

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

export default function OwnerDashboard(){

const router = useRouter();

const [stats,setStats] = useState({
totalShipment:0,
totalRevenue:0,
totalExpense:0,
netProfit:0,
paidInvoice:0,
unpaidInvoice:0
});

const [chartData,setChartData] = useState([]);
const [expenseData,setExpenseData] = useState([]);
const [shipmentProfit,setShipmentProfit] = useState([]);

const [fromDate,setFromDate] = useState("");
const [toDate,setToDate] = useState("");

const [loading,setLoading] = useState(true);

const [insight,setInsight] = useState([]);
const [businessStatus,setBusinessStatus] = useState("Healthy");
const [profitMargin,setProfitMargin] = useState(0);
const [forecastRevenue,setForecastRevenue] = useState(0);
const [forecastProfit,setForecastProfit] = useState(0);

useEffect(()=>{

const checkUser = async()=>{

const {data} = await supabase.auth.getUser();

if(!data?.user){
router.push("/owner-login");
}

};

checkUser();

},[]);

useEffect(()=>{
loadDashboard();
},[fromDate,toDate]);

const handleLogout = async()=>{

await supabase.auth.signOut();
router.push("/owner-login");

};

const exportExcel = () => {

const summary = [
{
TotalShipment: stats.totalShipment,
Revenue: stats.totalRevenue,
Expense: stats.totalExpense,
NetProfit: stats.netProfit,
PaidInvoice: stats.paidInvoice,
UnpaidInvoice: stats.unpaidInvoice
}
];

const wb = XLSX.utils.book_new();

const ws1 = XLSX.utils.json_to_sheet(summary);
const ws2 = XLSX.utils.json_to_sheet(chartData);
const ws3 = XLSX.utils.json_to_sheet(expenseData);
const ws4 = XLSX.utils.json_to_sheet(shipmentProfit);

XLSX.utils.book_append_sheet(wb, ws1, "Summary");
XLSX.utils.book_append_sheet(wb, ws2, "Revenue Chart");
XLSX.utils.book_append_sheet(wb, ws3, "Expense Breakdown");
XLSX.utils.book_append_sheet(wb, ws4, "Shipment Profit");

XLSX.writeFile(wb,"Owner_Dashboard_Report.xlsx");

};

const loadDashboard = async()=>{

setLoading(true);

let invoiceQuery = supabase
.from("invoices")
.select("total,status,created_at,shipment_id");

let expenseQuery = supabase
.from("expenses")
.select("amount,category,shipment_id,created_at");

if(fromDate){
invoiceQuery = invoiceQuery.gte("created_at", fromDate+"T00:00:00");
expenseQuery = expenseQuery.gte("created_at", fromDate+"T00:00:00");
}

if(toDate){
invoiceQuery = invoiceQuery.lte("created_at", toDate+"T23:59:59");
expenseQuery = expenseQuery.lte("created_at", toDate+"T23:59:59");
}

const {data:shipments} = await supabase
.from("shipments")
.select("id,tracking_number");

const {data:invoices} = await invoiceQuery;
const {data:expenses} = await expenseQuery;

/* SUMMARY */

const totalShipment = shipments?.length || 0;

const totalRevenue =
(invoices || []).reduce((acc,i)=>acc+Number(i.total||0),0);

const totalExpense =
(expenses || []).reduce((acc,e)=>acc+Number(e.amount||0),0);

const netProfit = totalRevenue-totalExpense;

const paidInvoice =
(invoices || []).filter(i=>String(i.status).toLowerCase()==="paid").length;

const unpaidInvoice =
(invoices || []).filter(i=>String(i.status).toLowerCase()==="unpaid").length;

/* PROFIT MARGIN */

const margin = totalRevenue ? ((netProfit/totalRevenue)*100).toFixed(2) : 0;

setProfitMargin(margin);

/* BUSINESS STATUS */

let status="Healthy";

if(margin<20) status="Warning";
if(margin<10) status="Critical";

setBusinessStatus(status);

/* REVENUE PER MONTH */

const revenueByMonth={};
const expenseByMonth={};

(invoices||[]).forEach(inv=>{

const month=new Date(inv.created_at)
.toLocaleString("default",{month:"short",year:"numeric"});

revenueByMonth[month]=(revenueByMonth[month]||0)+Number(inv.total||0);

});

(expenses||[]).forEach(exp=>{

const month=new Date(exp.created_at)
.toLocaleString("default",{month:"short",year:"numeric"});

expenseByMonth[month]=(expenseByMonth[month]||0)+Number(exp.amount||0);

});

const mergedMonths=Object.keys({...revenueByMonth,...expenseByMonth});

const finalChartData=mergedMonths.map(m=>({

month:m,
revenue:revenueByMonth[m]||0,
expense:expenseByMonth[m]||0,
profit:(revenueByMonth[m]||0)-(expenseByMonth[m]||0)

}));

/* EXPENSE CATEGORY */

const expenseCategory={};

(expenses||[]).forEach(exp=>{

const cat=exp.category||"Lainnya";

expenseCategory[cat]=(expenseCategory[cat]||0)+Number(exp.amount||0);

});

const expenseCategoryData=Object.keys(expenseCategory).map(k=>({
category:k,
total:expenseCategory[k]
}));

/* PROFIT PER SHIPMENT */

const shipmentMap={};

(invoices||[]).forEach(inv=>{

if(!inv.shipment_id) return;

shipmentMap[inv.shipment_id]=shipmentMap[inv.shipment_id]||{revenue:0,expense:0};

shipmentMap[inv.shipment_id].revenue+=Number(inv.total||0);

});

(expenses||[]).forEach(exp=>{

if(!exp.shipment_id) return;

shipmentMap[exp.shipment_id]=shipmentMap[exp.shipment_id]||{revenue:0,expense:0};

shipmentMap[exp.shipment_id].expense+=Number(exp.amount||0);

});

const shipmentProfitData=Object.keys(shipmentMap).map(id=>{

const ship=shipments?.find(s=>s.id===id);

const revenue=shipmentMap[id].revenue;
const expense=shipmentMap[id].expense;

return{

shipment:ship?.tracking_number||id,
revenue,
expense,
profit:revenue-expense

};

});

/* FORECAST */

const avgRevenue=totalShipment?totalRevenue/totalShipment:0;
const avgProfit=totalShipment?netProfit/totalShipment:0;

const forecastShip=totalShipment*1.1;

setForecastRevenue(Math.round(avgRevenue*forecastShip));
setForecastProfit(Math.round(avgProfit*forecastShip));

/* AI INSIGHT */

const insights=[
`Profit margin saat ini ${margin}%`,
`Status bisnis : ${status}`,
`Forecast revenue bulan depan Rp ${Math.round(avgRevenue*forecastShip).toLocaleString()}`,
`Forecast profit bulan depan Rp ${Math.round(avgProfit*forecastShip).toLocaleString()}`
];

setInsight(insights);

/* SET STATE */

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

if(loading){
return <div style={{padding:40}}>Loading dashboard...</div>;
}

return(

<div style={{padding:40}}>

{/* HEADER */}

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}>

<h1>Owner Executive Dashboard</h1>

<div style={{display:"flex",gap:10}}>

<button
onClick={exportExcel}
style={{
background:"#16a34a",
color:"white",
padding:"8px 15px",
border:"none",
cursor:"pointer",
borderRadius:6
}}
>
Export Excel
</button>

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
Logout
</button>

</div>

</div>

{/* DATE FILTER */}

<div style={{marginTop:20,marginBottom:30}}>

<input
type="date"
value={fromDate}
onChange={(e)=>setFromDate(e.target.value)}
/>

<input
type="date"
value={toDate}
onChange={(e)=>setToDate(e.target.value)}
style={{marginLeft:10}}
/>

</div>

{/* SUMMARY */}

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:20
}}>

<Card title="Total Shipment" value={stats.totalShipment}/>

<Card title="Revenue" value={`Rp ${stats.totalRevenue.toLocaleString()}`}/>

<Card title="Expense" value={`Rp ${stats.totalExpense.toLocaleString()}`}/>

<Card title="Net Profit" value={`Rp ${stats.netProfit.toLocaleString()}`} highlight/>

<Card title="Paid Invoice" value={stats.paidInvoice}/>
<Card title="Unpaid Invoice" value={stats.unpaidInvoice}/>

</div>

{/* BUSINESS STATUS */}

<div style={{
marginTop:30,
padding:20,
background:"#020617",
borderRadius:12,
color:"white"
}}>

<h2>Business Status</h2>

<p>Status : {businessStatus}</p>
<p>Profit Margin : {profitMargin}%</p>
<p>Forecast Revenue : Rp {forecastRevenue.toLocaleString()}</p>
<p>Forecast Profit : Rp {forecastProfit.toLocaleString()}</p>

</div>

{/* CHART */}

<h2 style={{marginTop:50}}>Revenue & Profit Chart</h2>

<ResponsiveContainer width="100%" height={300}>

<LineChart data={chartData}>

<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="month"/>
<YAxis/>
<Tooltip/>
<Legend/>

<Line type="monotone" dataKey="revenue" stroke="#2563eb"/>
<Line type="monotone" dataKey="expense" stroke="#dc2626"/>
<Line type="monotone" dataKey="profit" stroke="#16a34a"/>

</LineChart>

</ResponsiveContainer>

{/* EXPENSE */}

<h2 style={{marginTop:50}}>Expense Breakdown</h2>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={expenseData}>

<CartesianGrid strokeDasharray="3 3"/>
<XAxis dataKey="category"/>
<YAxis/>
<Tooltip/>

<Bar dataKey="total" fill="#0f172a"/>

</BarChart>

</ResponsiveContainer>

{/* PROFIT SHIPMENT */}

<h2 style={{marginTop:50}}>Profit per Shipment</h2>

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

{/* INSIGHT */}

<div style={{
marginTop:40,
background:"#020617",
padding:20,
borderRadius:12,
color:"white"
}}>

<h2>AI Business Insight</h2>

{insight.map((i,index)=>(
<p key={index}>• {i}</p>
))}

</div>

</div>

);

}

function Card({title,value,highlight}){

return(

<div style={{
padding:25,
borderRadius:15,
background:highlight?"#0f172a":"#1e293b",
color:"white",
boxShadow:"0 10px 25px rgba(0,0,0,0.2)"
}}>

<h3>{title}</h3>
<h2>{value}</h2>

</div>

);

}