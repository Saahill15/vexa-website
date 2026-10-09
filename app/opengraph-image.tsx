import { ImageResponse } from "next/og";

export const alt = "VEXA. Gaming campaigns built around a business problem.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ShareImage(): ImageResponse {
  return new ImageResponse(
    <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F7F5EF", padding: "64px", color: "#182522", borderTop: "12px solid #F56B30"}}>
      <div style={{display: "flex", fontSize: 32, letterSpacing: 4}}>VEXA</div>
      <div style={{display: "flex", flexDirection: "column", fontSize: 66, lineHeight: 1.06, maxWidth: 1040, fontWeight: 700}}>
        <span>Gaming campaigns built</span><span>around a business problem.</span>
      </div>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #BDB7AD", paddingTop: "24px", fontSize: 24}}><span>Brand campaigns · Esports business advisory</span><span>vexadigital.in</span></div>
    </div>,
    size,
  );
}
