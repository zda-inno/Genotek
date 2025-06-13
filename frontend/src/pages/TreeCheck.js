import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray};
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #f3f3f3;
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  background-color: ${({ theme }) => theme.colors.errorLight};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: 1rem;
`;

const ResultsContainer = styled.div`
  background-color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CheckSection = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  h3 {
    margin-top: 0;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PersonList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 0.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    &:last-child {
      border-bottom: none;
    }
  }
`;

const TreeCheck = () => {
  const [treeId, setTreeId] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateTreeId = (id) => {
    if (!id.trim()) {
      return 'Tree ID cannot be empty';
    }
    if (id.length < 3) {
      return 'Tree ID must be at least 3 characters long';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateTreeId(treeId);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:8000/api/checks/checks/basic/${treeId}`);
      setResults(response.data);
    } catch (err) {
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data?.detail || 'Server error occurred');
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check if the server is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An error occurred while setting up the request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>Check Family Tree</h2>
      <SearchForm onSubmit={handleSubmit}>
        <Input
          type="text"
          value={treeId}
          onChange={(e) => setTreeId(e.target.value)}
          placeholder="Enter family tree ID"
          required
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading && <LoadingSpinner />}
          {loading ? 'Checking...' : 'Check'}
        </Button>
      </SearchForm>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {results && (
        <ResultsContainer>
          <h3>Check Results</h3>
          <CheckSection>
            <h4>Negative Age Check</h4>
            {results.checks.negative_age.is_it ? (
              <>
                <p>Found persons with negative age:</p>
                <PersonList>
                  {results.checks.negative_age.persons.map((person, index) => (
                    <li key={index}>
                      {person.person} (Age: {person.age})
                    </li>
                  ))}
                </PersonList>
              </>
            ) : (
              <p>No persons with negative age found.</p>
            )}
          </CheckSection>

          <CheckSection>
            <h4>Large Age Check</h4>
            {results.checks.large_age.is_it ? (
              <>
                <p>Found persons with age over 100:</p>
                <PersonList>
                  {results.checks.large_age.persons.map((person, index) => (
                    <li key={index}>
                      {person.person} (Age: {person.age})
                    </li>
                  ))}
                </PersonList>
              </>
            ) : (
              <p>No persons with age over 100 found.</p>
            )}
          </CheckSection>
        </ResultsContainer>
      )}
    </Container>
  );
};

export default TreeCheck; 