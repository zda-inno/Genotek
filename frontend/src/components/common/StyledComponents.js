import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

export const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &.primary {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryDark};
    }
  }

  &.secondary {
    background-color: ${({ theme }) => theme.colors.secondary};
    color: white;
    &:hover {
      background-color: ${({ theme }) => theme.colors.secondaryDark};
    }
  }
`;

export const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.lg};
`;

export const CardHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

export const CardContent = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`; 