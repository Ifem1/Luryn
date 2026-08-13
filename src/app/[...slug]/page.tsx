import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SafetyBanner } from "@/components/Domain";
import { LabWorkspace } from "@/components/LabWorkspace";

export default async function Route({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = `/${slug.join("/")}`;
  return <AppShell><section className="route"><div className="eyebrow">Chain-backed workspace</div><h1 style={{ fontSize: "clamp(36px,5vw,58px)" }}>{path === "/labs" ? "Labs" : "This surface awaits configuration."}</h1>{path === "/labs" ? <LabWorkspace /> : <div className="empty"><p>This route is not configured.</p></div>}<p><Link className="button alt" href="/about/safety">Read the safety boundary</Link></p><SafetyBanner /></section></AppShell>;
}
