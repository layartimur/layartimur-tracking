import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      // Jika tidak login → redirect ke login
      router.push("/login");
    } else {
      // Jika login → tampilkan email
      setUserEmail(data.session.user.email);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard Admin</h1>
      <p>Admin system ready</p>

      <hr style={{ margin: "20px 0" }} />

      <p>
        <strong>Login sebagai:</strong> {userEmail}
      </p>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/login");
        }}
        style={{
          marginTop: 20,
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