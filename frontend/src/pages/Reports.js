import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  PageContainer,
  Header,
  Controls,
  Button,
  Grid as ReportsGrid,
  Card as ReportCard
} from '../components/common/StyledComponents';

const ReportHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.primary};
  }

  .report-date {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textLight};
  }
`;

const ReportContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text};
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
      padding: ${({ theme }) => theme.spacing.xs} 0;
      color: ${({ theme }) => theme.colors.text};
      position: relative;
      padding-left: ${({ theme }) => theme.spacing.md};

      &:before {
        content: "•";
        position: absolute;
        left: 0;
        color: ${({ theme }) => theme.colors.primary};
      }
    }
  }
`;

const ReportActions = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Reports = () => {
  const { treeId } = useParams();

  return (
    <PageContainer>
      <Header>
        <h1>Reports - Tree {treeId}</h1>
        <Controls>
          <Button className="primary">Generate New Report</Button>
          <Button className="secondary">Export All</Button>
        </Controls>
      </Header>

      <ReportsGrid>
        <ReportCard>
          <ReportHeader>
            <h3>Anomaly Summary Report</h3>
            <span className="report-date">Last updated: --</span>
          </ReportHeader>
          <ReportContent>
            <p>Comprehensive overview of all detected anomalies</p>
            <ul>
              <li>Severity distribution</li>
              <li>Type categorization</li>
              <li>Resolution status</li>
            </ul>
          </ReportContent>
          <ReportActions>
            <Button className="secondary">View</Button>
            <Button className="secondary">Export</Button>
          </ReportActions>
        </ReportCard>

        <ReportCard>
          <ReportHeader>
            <h3>Temporal Analysis Report</h3>
            <span className="report-date">Last updated: --</span>
          </ReportHeader>
          <ReportContent>
            <p>Detailed analysis of temporal anomalies</p>
            <ul>
              <li>Age gap analysis</li>
              <li>Lifespan overlaps</li>
              <li>Timeline conflicts</li>
            </ul>
          </ReportContent>
          <ReportActions>
            <Button className="secondary">View</Button>
            <Button className="secondary">Export</Button>
          </ReportActions>
        </ReportCard>

        <ReportCard>
          <ReportHeader>
            <h3>Structural Analysis Report</h3>
            <span className="report-date">Last updated: --</span>
          </ReportHeader>
          <ReportContent>
            <p>Analysis of structural anomalies in relationships</p>
            <ul>
              <li>Circular relationships</li>
              <li>High-degree nodes</li>
              <li>Relationship patterns</li>
            </ul>
          </ReportContent>
          <ReportActions>
            <Button className="secondary">View</Button>
            <Button className="secondary">Export</Button>
          </ReportActions>
        </ReportCard>
      </ReportsGrid>
    </PageContainer>
  );
};

export default Reports; 