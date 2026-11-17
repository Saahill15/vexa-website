import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { searchContacts } from "@/lib/contacts";
import { ADDRESSES, contactPhotos, googleContacts } from "@/lib/gmail";

export const dynamic = "force-dynamic";

/** Address suggestions for the compose window. Admins only: anyone else gets the same 404 as any other admin path. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return new NextResponse(null, { status: 404 });
  const q = new URL(request.url).searchParams.get("q") ?? "";
  // without `full=1` the answer is the site's own list, at once; the page then asks again with `full=1` for Google's people and photos
  const full = new URL(request.url).searchParams.get("full") === "1";
  const [mine, google] = await Promise.all([searchContacts(q, Object.values(ADDRESSES)), full ? googleContacts(q) : Promise.resolve([])]);
  // the site's own list first (people written to most), then Google's, without repeats; five of ours leave room for Google's
  const found: { email: string; name: string }[] = [];
  const add = (c: { email: string; name: string }) => {
    const e = found.find((f) => f.email === c.email);
    if (e) e.name ||= c.name;
    else found.push({ ...c });
  };
  mine.slice(0, 5).forEach(add);
  google.forEach(add);
  mine.slice(5).forEach(add);
  found.length = Math.min(found.length, 8);
  const photos = await contactPhotos(found.map((c) => c.email), !full);
  const contacts = found.map((c) => ({ ...c, photo: photos[c.email.toLowerCase()] }));
  return NextResponse.json({ contacts }, { headers: { "Cache-Control": "private, no-store" } });
}
