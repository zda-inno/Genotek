import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { Button } from '../components/common/StyledComponents';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Section = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;

  h3 {
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
    text-transform: uppercase;
  }

  .value {
    font-size: 2rem;
    font-weight: bold;
    color: ${({ theme, severity }) => {
      switch (severity) {
        case 'critical':
          return theme.colors.error;
        case 'warning':
          return theme.colors.warning;
        case 'info':
          return theme.colors.info;
        default:
          return theme.colors.primary;
      }
    }};
  }
`;

const CheckList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CheckItem = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.background};

  h4 {
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    color: ${({ theme, hasIssues }) => hasIssues ? theme.colors.error : theme.colors.success};
  }

  .description {
    margin: ${({ theme }) => theme.spacing.sm} 0;
    color: ${({ theme }) => theme.colors.text};
  }

  .persons-list {
    margin-top: ${({ theme }) => theme.spacing.sm};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  .person-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.spacing.sm};
    background-color: ${({ theme }) => theme.colors.primaryLight};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    
    .name {
      color: ${({ theme }) => theme.colors.primary};
      font-weight: 500;
    }
    
    .age {
      color: ${({ theme }) => theme.colors.text};
      font-size: 0.9rem;
    }
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.error};
  background-color: ${({ theme }) => theme.colors.errorLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const getCheckTitle = (checkName) => {
  const titles = {
    negative_age: 'Negative Age Check',
    large_age: 'Large Age Check'
  };
  return titles[checkName] || checkName;
};

const getCheckDescription = (checkName) => {
  const descriptions = {
    negative_age: 'Checks for persons with negative age values',
    large_age: 'Checks for persons with unusually large age values'
  };
  return descriptions[checkName] || '';
};

const AnomalyAnalysis = () => {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/checks/checks/basic/${treeId}`);
        setAnalysis(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [treeId]);

  const handleBack = () => {
    navigate(`/tree/${treeId}`);
  };

  const getTotalIssues = () => {
    if (!analysis?.checks) return 0;
    return Object.values(analysis.checks).filter(check => check.is_it).length;
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading analysis results...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <h3>Error loading analysis</h3>
          <p>{error}</p>
          <Button onClick={handleBack}>Back to Tree</Button>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Tree Analysis Results</h1>
        <Button onClick={handleBack}>Back to Tree</Button>
      </Header>

      <Section>
        <h2>Summary</h2>
        <StatsGrid>
          <StatCard>
            <h3>Total Issues Found</h3>
            <div className="value">{getTotalIssues()}</div>
          </StatCard>
          <StatCard>
            <h3>Checks Performed</h3>
            <div className="value">{Object.keys(analysis?.checks || {}).length}</div>
          </StatCard>
        </StatsGrid>
      </Section>

      <Section>
        <h2>Detailed Analysis</h2>
        <CheckList>
          {analysis?.checks && Object.entries(analysis.checks).map(([checkName, check]) => (
            <CheckItem key={checkName} hasIssues={check.is_it}>
              <h4>{getCheckTitle(checkName)}</h4>
              <p className="description">{getCheckDescription(checkName)}</p>
              {check.is_it && check.persons && check.persons.length > 0 && (
                <div className="persons-list">
                  {check.persons.map((person, index) => (
                    <div key={index} className="person-item">
                      <span className="name">{person.person}</span>
                      {person.age && <span className="age">{person.age} years</span>}
                    </div>
                  ))}
                </div>
              )}
              {!check.is_it && (
                <p className="description">No issues found</p>
              )}
            </CheckItem>
          ))}
        </CheckList>
      </Section>
    </Container>
  );
};

export default AnomalyAnalysis; 