import React from 'react';
import styled from 'styled-components';
import MainLayout from '../components/layout/MainLayout';

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Hero = styled.section`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl} 0;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h1 {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Features = styled.section`
  h2 {
    text-align: center;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FeatureCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Home = () => {
  return (
    <MainLayout>
      <PageContainer>
        <Hero>
          <h1>Welcome to Genotek</h1>
          <p>Genetic Analysis Platform</p>
        </Hero>
        <Features>
          <h2>Our Features</h2>
          <FeatureGrid>
            <FeatureCard>
              <h3>Genetic Analysis</h3>
              <p>Advanced tools for genetic data analysis</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Data Visualization</h3>
              <p>Interactive visualizations of genetic data</p>
            </FeatureCard>
            <FeatureCard>
              <h3>Research Tools</h3>
              <p>Comprehensive suite of research tools</p>
            </FeatureCard>
          </FeatureGrid>
        </Features>
      </PageContainer>
    </MainLayout>
  );
};

export default Home; 