export interface Border {
  color: string;
  radius: React.CSSProperties["borderRadius"];
  thickness: string;
  margin: string;
  padding: string;
  extension?: React.CSSProperties;
}
