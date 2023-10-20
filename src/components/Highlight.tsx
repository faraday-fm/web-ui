interface HighlightProps {
  text: string;
  highlight?: string;
}

export function Highlight({ text, highlight }: HighlightProps) {
  if (!highlight) return <span>{text}</span>;

  const index = text.search(new RegExp(highlight, "i"));
  if (index >= 0) {
    return (
      <span>
        {text.substring(0, index)}
        <em>{text.substring(index, index + highlight.length)}</em>
        {text.substring(index + highlight.length)}
      </span>
    );
  }
  return <span>{text}</span>;
}
