// "use client";

// import { useEffect } from "react";

// export default function ZegoScriptLoader() {
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src =
//       "https://cdn.zegocloud.com/zego-express-js/3.9.0/ZegoExpressEngine.min.js";
//     script.async = true;
//     script.onload = () => {
//       console.log("ZegoExpressEngine loaded:", !!window.ZegoExpressEngine);
//     };
//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   return null;
// }
