import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
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