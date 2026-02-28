import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Admin() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, []);

  return null;
}