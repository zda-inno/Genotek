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
    color: ${({ theme, hasIssues }) => hasIssues ? theme.colors.error : theme.colors.success};
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

  .count {
    margin: ${({ theme }) => theme.spacing.sm} 0;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const PersonsList = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 400px;
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing.sm};
`;

const PersonItem = styled.div`
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
  
  .missing-fields {
    display: flex;
    gap: ${({ theme }) => theme.spacing.xs};
    
    span {
      background-color: ${({ theme }) => theme.colors.errorLight};
      color: ${({ theme }) => theme.colors.error};
      padding: 2px 8px;
      border-radius: ${({ theme }) => theme.borderRadius.sm};
      font-size: 0.8rem;
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
    missing_birthdate: 'Missing Birth Date',
    invalid_date: 'Invalid Date',
    isolated_person: 'Isolated Person',
    non_reciprocal_relation: 'Non-Reciprocal Relation'
  };
  return titles[checkName] || checkName;
};

const getCheckDescription = (checkName) => {
  const descriptions = {
    missing_birthdate: 'Persons with missing birth date information',
    invalid_date: 'Persons with invalid date values',
    isolated_person: 'Persons without any family connections',
    non_reciprocal_relation: 'Relationships that are not properly reciprocated'
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

  const getTotalAffectedPersons = () => {
    if (!analysis?.checks) return 0;
    return Object.values(analysis.checks).reduce((total, check) => {
      return total + (check.persons?.length || 0);
    }, 0);
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
            <h3>Affected Persons</h3>
            <div className="value">{getTotalAffectedPersons()}</div>
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
              {check.is_it && (
                <>
                  <p className="count">Found {check.count} issues</p>
                  {check.persons && check.persons.length > 0 && (
                    <PersonsList>
                      {check.persons.map((person, index) => (
                        <PersonItem key={index}>
                          <span className="name">{person.person}</span>
                          {person.missing_fields && (
                            <div className="missing-fields">
                              {person.missing_fields.map((field, idx) => (
                                <span key={idx}>{field}</span>
                              ))}
                            </div>
                          )}
                        </PersonItem>
                      ))}
                    </PersonsList>
                  )}
                </>
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