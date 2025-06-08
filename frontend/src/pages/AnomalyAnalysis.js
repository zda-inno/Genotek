import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  PageContainer,
  Header,
  Controls,
  Button,
  Grid as StatsGrid
} from '../components/common/StyledComponents';

const Dashboard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
  }

  &.critical .stat-value {
    color: ${({ theme }) => theme.colors.error};
  }

  &.warning .stat-value {
    color: ${({ theme }) => theme.colors.warning};
  }

  &.info .stat-value {
    color: ${({ theme }) => theme.colors.info};
  }
`;

const Filters = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  label {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }

  select {
    padding: ${({ theme }) => theme.spacing.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    background-color: ${({ theme }) => theme.colors.white};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  th, td {
    padding: ${({ theme }) => theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    background-color: ${({ theme }) => theme.colors.background};
    font-weight: 500;
  }

  .placeholder-text {
    text-align: center;
    color: ${({ theme }) => theme.colors.textLight};
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

const AnomalyAnalysis = () => {
  const { treeId } = useParams();

  return (
    <PageContainer>
      <Header>
        <h1>Anomaly Analysis - Tree {treeId}</h1>
        <Controls>
          <Button className="primary">Run Full Scan</Button>
          <Button className="secondary">Export Report</Button>
        </Controls>
      </Header>

      <Dashboard>
        <StatsGrid>
          <StatCard>
            <h3>Total Anomalies</h3>
            <p className="stat-value">--</p>
          </StatCard>
          <StatCard className="critical">
            <h3>Critical</h3>
            <p className="stat-value">--</p>
          </StatCard>
          <StatCard className="warning">
            <h3>Warning</h3>
            <p className="stat-value">--</p>
          </StatCard>
          <StatCard className="info">
            <h3>Info</h3>
            <p className="stat-value">--</p>
          </StatCard>
        </StatsGrid>

        <Filters>
          <FilterGroup>
            <label>Severity</label>
            <select>
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </FilterGroup>
          <FilterGroup>
            <label>Type</label>
            <select>
              <option value="all">All Types</option>
              <option value="temporal">Temporal</option>
              <option value="structural">Structural</option>
              <option value="embedding">Embedding-based</option>
            </select>
          </FilterGroup>
        </Filters>

        <Table>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Type</th>
              <th>Description</th>
              <th>Individuals</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" className="placeholder-text">
                No anomalies detected. Run a scan to begin analysis.
              </td>
            </tr>
          </tbody>
        </Table>
      </Dashboard>
    </PageContainer>
  );
};

export default AnomalyAnalysis; 