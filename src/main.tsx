import { createRoot } from "react-dom/client";
import { Scene } from "./Scene";

const root = document.getElementById("root");
if (!root) throw new Error("Missing app root");
createRoot(root).render(<Scene />);
