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

const AnomalyList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AnomalyItem = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => theme.colors.background};

  h4 {
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    color: ${({ theme }) => theme.colors.error};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
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
        <p>Total Anomalies Found: {analysis?.anomalies?.length || 0}</p>
      </Section>

      <Section>
        <h2>Anomalies</h2>
        <AnomalyList>
          {analysis?.anomalies?.map((anomaly, index) => (
            <AnomalyItem key={index}>
              <h4>{anomaly.type}</h4>
              <p>{anomaly.description}</p>
              {anomaly.affected_persons && (
                <p>Affected persons: {anomaly.affected_persons.join(', ')}</p>
              )}
            </AnomalyItem>
          ))}
          {(!analysis?.anomalies || analysis.anomalies.length === 0) && (
            <p>No anomalies found in this tree.</p>
          )}
        </AnomalyList>
      </Section>
    </Container>
  );
};

export default AnomalyAnalysis; 