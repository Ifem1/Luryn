import { AppShell } from "@/components/AppShell";
import { WalletPanel } from "@/components/WalletPanel";
export default function WalletPage(){return <AppShell><section className="route"><div className="eyebrow">Transaction access</div><h1 style={{fontSize:"clamp(38px,5vw,62px)"}}>Your wallet, your signature.</h1><p className="lead">Luryn never holds a platform signing key for users. Connect your own injected wallet before taking any on-chain action.</p><WalletPanel/></section></AppShell>}
