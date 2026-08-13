import { AppShell } from "@/components/AppShell";
import { DashboardPanel } from "@/components/DashboardPanel";
export default function Dashboard(){return <AppShell><section className="route"><div className="eyebrow">User dashboard</div><h1 style={{fontSize:"clamp(38px,5vw,62px)"}}>Your Luryn dashboard.</h1><p className="lead">Manage your Luryn connection, copy the verified contract address, and review account-scoped activity where the contract exposes it.</p><DashboardPanel/></section></AppShell>}
