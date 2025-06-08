import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  Controls
} from '../common/StyledComponents';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const TreeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TreeControls = styled(Controls)`
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TreeContainer = styled.div`
  overflow: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  min-height: 500px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const FamilyGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ParentsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ChildrenContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: -${({ theme }) => theme.spacing.md};
    left: 50%;
    width: 2px;
    height: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

const IndividualNode = styled.div`
  background-color: ${({ theme, gender }) => 
    gender === 'M' ? theme.colors.primary : theme.colors.secondary};
  color: white;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  min-width: 200px;
  text-align: center;
  position: relative;

  &:not(:last-child):after {
    content: '';
    position: absolute;
    top: 50%;
    right: -${({ theme }) => theme.spacing.md};
    width: ${({ theme }) => theme.spacing.md};
    height: 2px;
    background-color: ${({ theme }) => theme.colors.border};
  }

  .name {
    font-weight: bold;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .dates {
    font-size: 0.9em;
    opacity: 0.9;
  }
`;

const mockTreeData = {
  id: 'tree_123',
  name: 'Smith Family Tree',
  individuals: [
    {
      id: 'I1',
      name: 'John Smith',
      birthDate: '1950-05-15',
      deathDate: null,
      gender: 'M',
      parents: [],
      spouses: ['I2'],
      children: ['I3', 'I4']
    },
    {
      id: 'I2',
      name: 'Mary Johnson',
      birthDate: '1952-08-20',
      deathDate: null,
      gender: 'F',
      parents: [],
      spouses: ['I1'],
      children: ['I3', 'I4']
    },
    {
      id: 'I3',
      name: 'James Smith',
      birthDate: '1975-03-10',
      deathDate: null,
      gender: 'M',
      parents: ['I1', 'I2'],
      spouses: ['I5'],
      children: ['I6']
    },
    {
      id: 'I4',
      name: 'Sarah Smith',
      birthDate: '1978-11-25',
      deathDate: null,
      gender: 'F',
      parents: ['I1', 'I2'],
      spouses: [],
      children: []
    },
    {
      id: 'I5',
      name: 'Emily Brown',
      birthDate: '1976-07-12',
      deathDate: null,
      gender: 'F',
      parents: [],
      spouses: ['I3'],
      children: ['I6']
    },
    {
      id: 'I6',
      name: 'Michael Smith',
      birthDate: '2000-09-30',
      deathDate: null,
      gender: 'M',
      parents: ['I3', 'I5'],
      spouses: [],
      children: []
    }
  ]
};

const TreeVisualization = ({ treeId }) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
  };

  const renderIndividual = (individual) => {
    const birthYear = new Date(individual.birthDate).getFullYear();
    const deathYear = individual.deathDate ? new Date(individual.deathDate).getFullYear() : null;
    
    return (
      <IndividualNode key={individual.id} gender={individual.gender}>
        <div className="name">{individual.name}</div>
        <div className="dates">
          {birthYear} {deathYear ? `- ${deathYear}` : ''}
        </div>
      </IndividualNode>
    );
  };

  const renderFamily = (parents, children) => {
    return (
      <FamilyGroup>
        <ParentsContainer>
          {parents.map(parentId => {
            const parent = mockTreeData.individuals.find(i => i.id === parentId);
            return renderIndividual(parent);
          })}
        </ParentsContainer>
        {children.length > 0 && (
          <ChildrenContainer>
            {children.map(childId => {
              const child = mockTreeData.individuals.find(i => i.id === childId);
              return renderIndividual(child);
            })}
          </ChildrenContainer>
        )}
      </FamilyGroup>
    );
  };

  const families = mockTreeData.individuals.reduce((acc, individual) => {
    if (individual.parents.length === 0) {
      const familyKey = individual.spouses.join('_');
      if (!acc[familyKey]) {
        acc[familyKey] = {
          parents: [...individual.spouses, individual.id],
          children: individual.children
        };
      }
    }
    return acc;
  }, {});

  return (
    <Container>
      <TreeHeader>
        <h2>{mockTreeData.name}</h2>
        <TreeControls>
          <Button className="secondary" onClick={handleZoomIn}>Zoom In</Button>
          <Button className="secondary" onClick={handleZoomOut}>Zoom Out</Button>
          <Button className="secondary" onClick={handleReset}>Reset View</Button>
        </TreeControls>
      </TreeHeader>
      <TreeContainer style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
        {Object.values(families).map((family, index) => (
          <div key={index}>
            {renderFamily(family.parents, family.children)}
          </div>
        ))}
      </TreeContainer>
    </Container>
  );
};

export default TreeVisualization; 