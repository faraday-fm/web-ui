import { state } from "effie";
import { useState } from "react";

export function Inert() {
  const [inert, setInert] = useState(false);

  return state({
    inert,
    setInert,
  });
}
