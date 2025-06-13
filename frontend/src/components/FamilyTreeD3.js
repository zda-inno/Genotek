import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const TreeContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 600px;
  overflow: auto;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const FamilyTreeD3 = ({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear previous tree
    d3.select(svgRef.current).selectAll("*").remove();

    // Convert flat data to hierarchical structure
    const buildHierarchy = (people) => {
      const personMap = new Map();
      const rootNodes = [];

      // First pass: create person objects
      people.forEach(person => {
        personMap.set(person.person_id, {
          ...person,
          children: []
        });
      });

      // Second pass: build relationships
      people.forEach(person => {
        const personObj = personMap.get(person.person_id);
        const parents = person.relatives
          .filter(rel => rel.relationType === 'parent')
          .map(rel => personMap.get(rel.person_id));

        if (parents.length === 0) {
          rootNodes.push(personObj);
        } else {
          parents.forEach(parent => {
            if (parent) {
              parent.children.push(personObj);
            }
          });
        }
      });

      return rootNodes[0] || null;
    };

    const root = buildHierarchy(data);
    if (!root) return;

    // Set up the tree layout
    const treeLayout = d3.tree()
      .nodeSize([80, 200])
      .separation((a, b) => {
        return a.parent === b.parent ? 1 : 1.5;
      });

    // Calculate the tree layout
    const treeData = treeLayout(d3.hierarchy(root));

    // Get container dimensions
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create a group for the tree
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, 50)`);

    // Add links
    g.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2);

    // Add nodes
    const node = g.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Add node circles
    node.append('circle')
      .attr('r', 30)
      .attr('fill', d => d.data.gender === 'Male' ? '#4a90e2' : '#e24a90')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add node labels
    node.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .style('font-size', '12px')
      .text(d => `${d.data.name} ${d.data.surname || ''}`);

    // Add birth year labels
    node.append('text')
      .attr('dy', '1.5em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .style('font-size', '10px')
      .text(d => d.data.birthdate?.year || 'Unknown');

  }, [data]);

  return (
    <TreeContainer ref={containerRef}>
      <svg ref={svgRef}></svg>
    </TreeContainer>
  );
};

export default FamilyTreeD3; 