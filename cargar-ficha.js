/* =====================================================================
   cargar-ficha.js · para el tracker (o cualquier otra herramienta)
   Lee una ficha guardada por el Lector de Fichas a partir del código
   corto (ej. AK48213) o del código largo (AVK1....).

   Uso en el HTML del tracker:
     <script type="module">
       import { leerFicha } from "./cargar-ficha.js";
       const ficha = await leerFicha("AK48213");   // objeto JSON o null
       console.log(ficha.personaje, ficha.atributos, ficha.bonos);
     </script>
   ===================================================================== */

// Pegá acá el MISMO firebaseConfig que pusiste en el Lector
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCzTfW6c4OltResFNP6FJ5-MV36Bz7iI74",
  authDomain: "trackerdefichas.firebaseapp.com",
  projectId: "trackerdefichas",
  storageBucket: "trackerdefichas.firebasestorage.app",
  messagingSenderId: "886445486854",
  appId: "1:886445486854:web:2812a46e0e4fdfa0d32487"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let db = null;
const base = () => db || (db = getFirestore(initializeApp(FIREBASE_CONFIG)));

// Código largo AVK1./AVK0. → objeto JSON
export async function decodificar(codigo){
  const [pre, cuerpo] = codigo.trim().split(".");
  const s = atob(cuerpo.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(s, c => c.charCodeAt(0));
  if(pre === "AVK0") return JSON.parse(new TextDecoder().decode(bytes));
  const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer();
  return JSON.parse(new TextDecoder().decode(buf));
}

// Código corto o largo → ficha (objeto). Si el texto tiene varias fichas devuelve un array.
export async function leerFicha(texto){
  const t = (texto || "").trim();
  if(/^AVK[01]\./.test(t)) return decodificar(t);
  const c = t.toUpperCase().replace(/[^A-Z0-9]/g, "");   // acepta "ak-48213"
  if(!/^AK\d{5}$/.test(c)) throw new Error("Código inválido: tiene que ser como AK48213");
  const snap = await getDoc(doc(base(), "fichas", c));
  return snap.exists() ? decodificar(snap.data().ficha) : null;
}
