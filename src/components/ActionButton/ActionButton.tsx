import styled from "styled-components";

type ActionButtonProps = {
  fnKey: string;
  header: string;
};

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
  color: var(--color-07);
`;

const HeaderButton = styled.div`
  text-align: left;
  width: 100%;
  background-color: var(--color-03);
  color: var(--color-00);
  padding: 0;
  cursor: pointer;
`;

export function ActionButton({ fnKey, header }: ActionButtonProps) {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <Root onMouseDown={(e) => e.preventDefault()}>
      <FnKey>{fnKey}</FnKey>
      <HeaderButton>{header}</HeaderButton>
    </Root>
  );
}
