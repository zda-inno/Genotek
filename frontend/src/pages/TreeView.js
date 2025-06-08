import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import TreeVisualization from '../components/tree/TreeVisualization';

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Visualization = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  min-height: 500px;
`;

const Stats = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StatsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const TreeView = () => {
  const { treeId } = useParams();

  return (
    <div>
      <Header>
        <h1>Tree Visualization</h1>
        <Controls>
          <input
            type="file"
            accept=".ged"
          />
          <button>Upload GEDCOM</button>
          <button>Export GEDCOM</button>
        </Controls>
      </Header>

      <Container>
        <Visualization>
          <TreeVisualization treeId={treeId} />
        </Visualization>
        <Stats>
          <StatsSection>
            <h3>Tree Statistics</h3>
            <div>
              <p>Total Individuals: 150</p>
              <p>Total Families: 45</p>
              <p>Anomalies Found: 3</p>
            </div>
          </StatsSection>
          <StatsSection>
            <h3>Anomaly Summary</h3>
            <div>
              <p>Date Inconsistencies: 2</p>
              <p>Relationship Conflicts: 1</p>
            </div>
          </StatsSection>
        </Stats>
      </Container>
    </div>
  );
};

export default TreeView; 