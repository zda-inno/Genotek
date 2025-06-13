import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/common/StyledComponents';
import FamilyTreeD3 from '../components/FamilyTreeD3';
import haystackData from '../data/haystack_test.json';

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  height: 70vh;
  min-height: 600px;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const Visualization = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: 0;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
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

const ActionsSection = styled(StatsSection)`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const TreeView = () => {
  const { treeId } = useParams();
  const navigate = useNavigate();

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting tree:', treeId);
  };

  const handleAnalyze = () => {
    navigate(`/anomaly-analysis/${treeId}`);
  };

  return (
    <div>
      <Header>
        <h1>Tree Visualization</h1>
      </Header>

      <Container>
        <Visualization>
          <FamilyTreeD3 data={haystackData} />
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
          <ActionsSection>
            <h3>Actions</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button onClick={handleAnalyze}>
                Analyze Tree
              </Button>
              <Button className="secondary" onClick={handleExport}>
                Export GEDCOM
              </Button>
            </div>
          </ActionsSection>
        </Stats>
      </Container>
    </div>
  );
};

export default TreeView; 