import { getSession } from "@/lib/session";
import PrestadorDashboard from "./PrestadorDashboard";

export default async function Page() {
  const session = await getSession();
  return <PrestadorDashboard user={session.user!} />;
}


