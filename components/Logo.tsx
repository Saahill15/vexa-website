import Image from "next/image";

/*
 * Vexa lockup: the orange V leaf mark with a heavy uppercase wordmark (set in the site font,
 * so it stays sharp at nav size) and the descriptor line. In the header, `collapsed` folds the wordmark back into the V
 * while the navigation is scrolled out of view, and it unfolds again when the navigation returns. The original logo files are unchanged in /public/img.
 */
export function Logo({ onDark = false, collapsed = false }: { onDark?: boolean; collapsed?: boolean }) {
  return (
    <span className={`logo${onDark ? " logo--dark" : ""}${collapsed ? " is-collapsed" : ""}`}>
      <Image src="/img/vexa-vmark.png" alt="" width={335} height={318} priority />
      <span className="logo-text">
        <b>VEXA</b>{" "}
        <small>Esports Consultancy</small>
      </span>
    </span>
  );
}
