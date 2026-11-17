import Image from "next/image";

/*
 * Vexa lockup for the new look: the V leaf mark with a heavy uppercase wordmark (set in the site font,
 * so it stays sharp at nav size) and the descriptor line. The original logo files are unchanged in /public/img.
 */
export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className={`logo${onDark ? " logo--dark" : ""}`}>
      <Image src="/img/vexa-vmark-teal.png" alt="" width={335} height={318} priority />
      <span className="logo-text">
        <b>VEXA</b>
        <small>Esports Consultancy</small>
      </span>
    </span>
  );
}
