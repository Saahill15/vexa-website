import { getDb } from "@/lib/db";

if (process.env.NEXT_PHASE !== "phase-production-build") getDb();
