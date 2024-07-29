import { useState } from "react";
import { state } from "react-rehoox";

export function Inert() {
  const [inert, setInert] = useState(false);

  return state({
    inert,
    setInert,
  });
}
