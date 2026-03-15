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

export default function Dashboard(){

const router = useRouter();

const [loading,setLoading] = useState(true);
const [userEmail,setUserEmail] = useState(null);

const [summary,setSummary] = useState({
revenue:0,
expenses:0,
profit:0
});

const [expenseDetail,setExpenseDetail] = useState({
shipment:0,
gaji:0,
lain:0
});

const [monthlyChart,setMonthlyChart] = useState(null);
const [expenseCategoryChart,setExpenseCategoryChart] = useState(null);

useEffect(()=>{
checkSession();
},[]);

const checkSession = async()=>{

const {data} = await supabase.auth.getSession();

if(!data.session){

router.push("/login");

}else{

setUserEmail(data.session.user.email);
loadFinanceData();
setLoading(false);

}

};

const loadFinanceData = async()=>{

const {data:invoices} = await supabase
.from("invoices")
.select("total,status,created_at");

const {data:expenses} = await supabase
.from("expenses")
.select("amount,category,shipment_id,created_at");

const paidInvoices =
invoices?.filter(i=>i.status==="Paid") || [];

const revenue =
paidInvoices.reduce((a,b)=>a+Number(b.total),0) || 0;

const shipmentExpenses =
expenses?.filter(e=>e.shipment_id!==null)
.reduce((a,b)=>a+Number(b.amount),0) || 0;

const gajiExpenses =
expenses?.filter(e=>e.category?.toLowerCase().includes("gaji"))
.reduce((a,b)=>a+Number(b.amount),0) || 0;

const otherExpenses =
expenses?.filter(e=>
e.shipment_id===null &&
!e.category?.toLowerCase().includes("gaji")
)
.reduce((a,b)=>a+Number(b.amount),0) || 0;

const totalExpenses =
shipmentExpenses + gajiExpenses + otherExpenses;

const profit = revenue - totalExpenses;

setSummary({
revenue,
expenses:totalExpenses,
profit
});

setExpenseDetail({
shipment:shipmentExpenses,
gaji:gajiExpenses,
lain:otherExpenses
});

const monthlyData = {};

paidInvoices.forEach(inv=>{

const month = inv.created_at.slice(0,7);

if(!monthlyData[month])
monthlyData[month] = {revenue:0,expenses:0};

monthlyData[month].revenue += Number(inv.total);

});

expenses?.forEach(exp=>{

const month = exp.created_at.slice(0,7);

if(!monthlyData[month])
monthlyData[month] = {revenue:0,expenses:0};

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
datasets:[
{
label:"Profit per Bulan",
data:profitValues,
backgroundColor:profitColors,
borderRadius:8
}
]
});

const categoryData = {};

expenses?.forEach(exp=>{

const kategori = exp.category || "Tidak ada kategori";

if(!categoryData[kategori]){
categoryData[kategori] = 0;
}

categoryData[kategori] += Number(exp.amount);

});

const categoryLabels = Object.keys(categoryData);
const categoryValues = Object.values(categoryData);

setExpenseCategoryChart({
labels:categoryLabels,
datasets:[
{
label:"Pengeluaran per Kategori",
data:categoryValues,
backgroundColor:[
"#3b82f6",
"#22c55e",
"#f59e0b",
"#ef4444",
"#8b5cf6",
"#14b8a6",
"#6366f1",
"#eab308"
],
borderRadius:8
}
]
});

};

const exportExcel = async()=>{

const {data:invoices} = await supabase
.from("invoices")
.select("invoice_number,total,status,created_at")
.eq("status","Paid");

const {data:expenses} = await supabase
.from("expenses")
.select("description,amount,created_at");

const revenue =
invoices?.reduce((a,b)=>a+Number(b.total),0) || 0;

const totalExpenses =
expenses?.reduce((a,b)=>a+Number(b.amount),0) || 0;

const profit = revenue-totalExpenses;

const summarySheet=[
{Keterangan:"Total Revenue",Nilai:revenue},
{Keterangan:"Total Expenses",Nilai:totalExpenses},
{Keterangan:"Laba Bersih",Nilai:profit}
];

const workbook = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(
workbook,
XLSX.utils.json_to_sheet(summarySheet),
"Summary"
);

XLSX.writeFile(
workbook,
"Laporan_Keuangan_Layar_Timur.xlsx"
);

};

const chartOptions = {

responsive:true,

plugins:{
legend:{display:false},
tooltip:{
callbacks:{
label:(context)=>{
return "Rp "+context.raw.toLocaleString("id-ID");
}
}
}
},

animation:{duration:800},

scales:{
y:{grid:{color:"#f1f5f9"}},
x:{grid:{display:false}}
}

};

if(loading)
return <div style={{padding:40}}>Loading...</div>;

return(

<div style={{padding:40}}>

<h1 style={{marginBottom:10}}>
🚛 Enterprise Dashboard
</h1>

<p>
<strong>Login:</strong> {userEmail}
</p>

<div className="navButtons">

<button onClick={()=>router.push("/dashboard/shipments")}>
📦 Shipments
</button>

<button onClick={()=>router.push("/dashboard/invoices")}>
🧾 Invoices
</button>

<button onClick={()=>router.push("/dashboard/expenses/create")}>
💸 Input Pengeluaran
</button>

</div>

<div className="cardContainer">

<Card title="Revenue" value={summary.revenue}/>
<Card title="Shipment Expense" value={expenseDetail.shipment}/>
<Card title="Gaji" value={expenseDetail.gaji}/>
<Card title="Lain-lain" value={expenseDetail.lain}/>
<Card title="Total Expenses" value={summary.expenses}/>
<Card title="Profit" value={summary.profit} highlight/>

</div>

<div className="chartContainer">
{monthlyChart && (
<Bar data={monthlyChart} options={chartOptions}/>
)}
</div>

<div className="chartContainer">
{expenseCategoryChart && (
<Bar data={expenseCategoryChart} options={chartOptions}/>
)}
</div>

<button
onClick={exportExcel}
style={{
marginTop:20,
padding:"10px 15px",
background:"#2563eb",
color:"white",
border:"none",
borderRadius:6,
cursor:"pointer"
}}
>
📥 Export Excel Report
</button>

<style jsx>{`

.navButtons{
margin-top:20px;
display:flex;
gap:15px;
flex-wrap:wrap;
}

.cardContainer{
display:flex;
gap:20px;
margin-top:30px;
flex-wrap:wrap;
width:100%;
}

.chartContainer{
margin-top:40px;
background:#fff;
padding:20px;
border-radius:10px;
box-shadow:0 5px 15px rgba(0,0,0,0.08);
}

`}</style>

</div>

);

}

function Card({title,value,highlight}){

return(

<div
style={{
flex:1,
minWidth:200,
padding:20,
borderRadius:10,
background:highlight ? "#16a34a":"#0f172a",
color:"white"
}}
>

<h3>{title}</h3>
<h2>Rp {value.toLocaleString()}</h2>

</div>

);

}