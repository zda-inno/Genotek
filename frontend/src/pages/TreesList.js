import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  Header,
  Controls,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions
} from '../components/common/StyledComponents';

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

// Mock data - в реальном приложении это будет приходить с бэкенда
const mockTrees = [
  {
    id: 'tree_123',
    name: 'Family Tree #1',
    individuals: 150,
    families: 45,
    anomalies: 3
  },
  {
    id: 'tree_456',
    name: 'Family Tree #2',
    individuals: 200,
    families: 60,
    anomalies: 5
  }
];

const TreesList = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredTrees = mockTrees.filter(tree => 
    tree.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tree.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Header>
        <h1>Genealogical Trees</h1>
        <Controls>
          <SearchInput
            type="text"
            placeholder="Search by Tree ID or name..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <Link to="/tree/new">
            <Button className="primary">Upload New Tree</Button>
          </Link>
        </Controls>
      </Header>

      <Grid>
        {filteredTrees.map(tree => (
          <Card key={tree.id}>
            <CardHeader>
              <h3>{tree.name}</h3>
              <span>ID: {tree.id}</span>
            </CardHeader>
            <CardContent>
              <p>Individuals: {tree.individuals}</p>
              <p>Families: {tree.families}</p>
              <p>Anomalies: {tree.anomalies}</p>
            </CardContent>
            <CardActions>
              <Link to={`/tree/${tree.id}`}>
                <Button className="secondary">View Tree</Button>
              </Link>
              <Link to={`/anomaly-analysis/${tree.id}`}>
                <Button className="secondary">Analyze</Button>
              </Link>
              <Link to={`/reports/${tree.id}`}>
                <Button className="secondary">Export</Button>
              </Link>
            </CardActions>
          </Card>
        ))}
      </Grid>
    </div>
  );
};

export default TreesList; 