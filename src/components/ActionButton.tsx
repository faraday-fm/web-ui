import styled from "@emotion/styled";
import { memo } from "react";

interface ActionButtonProps {
  fnKey: string;
  header: string;
}

const Root = styled.span`
  display: flex;
  flex-wrap: nowrap;
  align-items: baseline;
  padding-right: 0.5rem;
  &:last-child {
    padding-right: 0;
  }
`;

const FnKey = styled.span`
  color: ${(p) => p.theme.colors["actionBar.keyForeground"]};
  background-color: ${(p) => p.theme.colors["actionBar.keyBackground"]};
`;

const HeaderButton = styled.div`
  text-align: left;
  width: 100%;
  background-color: ${(p) => p.theme.colors["actionBar.buttonBackground"]};
  color: ${(p) => p.theme.colors["actionBar.buttonForeground"]};
  padding: 0;
  cursor: pointer;
`;

export const ActionButton = memo(function ActionButton({ fnKey, header }: ActionButtonProps) {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <Root onMouseDown={(e: React.MouseEvent) => e.preventDefault()}>
      <FnKey>{fnKey}</FnKey>
      <HeaderButton>{header}</HeaderButton>
    </Root>
  );
});
