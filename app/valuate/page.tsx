import { redirect } from "next/navigation";
export default function ValuatePage(){ redirect(process.env.VEXA_PREVIEW === "1" ? "http://localhost:3400" : "https://valuate.vexadigital.in"); }
