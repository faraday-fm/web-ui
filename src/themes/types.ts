import { CSSObject, CSSProperties } from "styled-components";

export interface Border {
  color: string;
  radius: CSSProperties["borderRadius"];
  thickness: string;
  margin: string;
  padding: string;
  extension?: CSSObject;
}
