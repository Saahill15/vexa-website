export type Audience = "brands" | "holders";

export const AUDIENCE_KEY = "vexa-audience";
export const AUDIENCE_EVENT = "vexa:audience";

export function isAudience(value: unknown): value is Audience {
  return value === "brands" || value === "holders";
}

/** Reads the audience from ?for=, then from localStorage. Browser only. */
export function readAudience(): Audience | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("for");
    if (isAudience(fromUrl)) return fromUrl;
    const stored = window.localStorage.getItem(AUDIENCE_KEY);
    if (isAudience(stored)) return stored;
  } catch {
    // Storage can be blocked; the page works without a stored choice.
  }
  return null;
}

export function saveAudience(value: Audience): void {
  try {
    window.localStorage.setItem(AUDIENCE_KEY, value);
  } catch {
    // Ignore blocked storage.
  }
  document.documentElement.dataset.audience = value;
  window.dispatchEvent(new CustomEvent<Audience>(AUDIENCE_EVENT, { detail: value }));
}

/** Runs in <head> before first paint so the audience layout never shifts after load. */
export const AUDIENCE_BOOT_SCRIPT = `(function(){try{var p=new URLSearchParams(location.search).get("for");var s=null;try{s=localStorage.getItem("${AUDIENCE_KEY}")}catch(e){}var a=(p==="brands"||p==="holders")?p:((s==="brands"||s==="holders")?s:null);if(a){document.documentElement.setAttribute("data-audience",a)}}catch(e){}})();`;
