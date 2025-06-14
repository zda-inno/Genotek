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

  // Создаем семейные единицы
  const createFamilyUnits = (people) => {
    if (!people || !people.length) return { units: new Map(), personToUnitMap: new Map() };

    const personMap = new Map(people.map(p => [p.person_id, p]));
    const units = new Map();
    const processed = new Set();
    const personToUnitMap = new Map();

    // Создаем единицы для пар
    people.forEach(person => {
      if (processed.has(person.person_id)) return;

      const spouseRel = person.relatives?.find(r =>
        r.relationType === 'spouse' &&
        personMap.has(r.person_id)
      );

      if (spouseRel) {
        const spouse = personMap.get(spouseRel.person_id);
        if (!spouse) return;

        const unitId = [person.person_id, spouse.person_id].sort().join('_');
        const unit = {
          id: unitId,
          type: 'couple',
          partners: [person, spouse],
          children: new Set()
        };
        units.set(unitId, unit);
        processed.add(person.person_id);
        processed.add(spouse.person_id);
        personToUnitMap.set(person.person_id, unit);
        personToUnitMap.set(spouse.person_id, unit);
      } else {
        const unit = {
          id: person.person_id,
          type: 'single',
          person: person,
          children: new Set()
        };
        units.set(person.person_id, unit);
        processed.add(person.person_id);
        personToUnitMap.set(person.person_id, unit);
      }
    });

    // Добавляем детей
    people.forEach(person => {
      const parentRels = person.relatives?.filter(r => r.relationType === 'parent') || [];
      parentRels.forEach(rel => {
        const parentUnit = personToUnitMap.get(rel.person_id);
        if (parentUnit) {
          parentUnit.children.add(person.person_id);
        }
      });
    });

    return { units, personToUnitMap };
  };

  // Строим иерархию с объединением родителей
  const buildHierarchy = (units, personToUnitMap) => {
    if (!units || !units.size) return { id: '__ROOT__', children: [] };

    const unitMap = new Map([...units].map(([id, unit]) => [id, unit]));
    const childrenMap = new Map();
    const parentMap = new Map();
    const visited = new Set();

    // Собираем связи родитель-ребенок
    units.forEach(unit => {
      unit.children.forEach(childId => {
        const childUnit = personToUnitMap.get(childId);
        if (!childUnit) return;

        if (!childrenMap.has(unit.id)) {
          childrenMap.set(unit.id, []);
        }
        childrenMap.get(unit.id).push(childUnit.id);

        if (!parentMap.has(childUnit.id)) {
          parentMap.set(childUnit.id, []);
        }
        parentMap.get(childUnit.id).push(unit.id);
      });
    });

    // Находим корни
    const roots = [];
    units.forEach((unit, id) => {
      if (!parentMap.has(id)) {
        roots.push(id);
      }
    });

    // Рекурсивное построение с объединением
    const buildNode = (unitId) => {
      if (visited.has(unitId)) return null;
      visited.add(unitId);

      const unit = unitMap.get(unitId);
      if (!unit) return null;

      const node = {
        id: unitId,
        unitData: unit,
        children: []
      };

      // Собираем всех родителей текущего узла
      const allParents = [];
      if (unit.type === 'couple') {
        unit.partners.forEach(partner => {
          const parentRels = partner.relatives?.filter(r => r.relationType === 'parent') || [];
          parentRels.forEach(rel => {
            const parentUnit = personToUnitMap.get(rel.person_id);
            if (parentUnit && !visited.has(parentUnit.id)) {
              allParents.push(parentUnit.id);
            }
          });
        });
      }

      // Создаем искусственный узел для объединения родителей
      if (allParents.length > 0) {
        const parentUnion = {
          id: `union_${unitId}`,
          type: 'union',
          children: []
        };

        allParents.forEach(parentId => {
          const parentNode = buildNode(parentId);
          if (parentNode) {
            parentUnion.children.push(parentNode);
          }
        });

        if (parentUnion.children.length > 0) {
          node.children.push(parentUnion);
        }
      }

      // Добавляем детей
      if (childrenMap.has(unitId)) {
        childrenMap.get(unitId).forEach(childId => {
          const childNode = buildNode(childId);
          if (childNode) {
            node.children.push(childNode);
          }
        });
      }

      return node;
    };

    const rootNodes = roots.map(rootId => buildNode(rootId)).filter(Boolean);
    return {
      id: '__ROOT__',
      children: rootNodes
    };
  };

  useEffect(() => {
    if (!data || !data.length || !svgRef.current || !containerRef.current) return;

    try {
      // Создаем семейные единицы
      const { units, personToUnitMap } = createFamilyUnits(data);
      const hierarchyData = buildHierarchy(units, personToUnitMap);
      const root = d3.hierarchy(hierarchyData);

      // Настраиваем размеры
      const { clientWidth: width, clientHeight: height } = containerRef.current;
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .call(d3.zoom()
          .scaleExtent([0.1, 5])
          .on('zoom', e => zoomG.attr('transform', e.transform))
        );

      svg.selectAll('*').remove();
      const zoomG = svg.append('g');
      const g = zoomG.append('g').attr('transform', `translate(50, 50)`);

      // Конфигурация дерева
      const treeLayout = d3.tree()
        .nodeSize([220, 180])
        .separation((a, b) => a.parent === b.parent ? 1.2 : 2.0);

      const treeData = treeLayout(root);

      // Рисуем связи
      g.selectAll('.link')
        .data(treeData.links().filter(l =>
          l.source.data.id !== '__ROOT__' &&
          l.target.data.id !== '__ROOT__'
        ))
        .enter().append('path')
          .attr('class', 'link')
          .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
          )
          .attr('stroke', '#aaa')
          .attr('fill', 'none')
          .attr('stroke-width', 2);

      // Фильтруем узлы
      const validNodes = treeData.descendants().filter(d =>
        d.data.id !== '__ROOT__' &&
        d.data.unitData
      );

      // Рисуем узлы
      const nodes = g.selectAll('.node')
        .data(validNodes, d => d.data.id)
        .enter().append('g')
          .attr('class', 'node')
          .attr('transform', d => `translate(${d.x},${d.y})`);

      // Обработка узлов
      nodes.each(function(d) {
        const node = d3.select(this);
        const unit = d.data.unitData;
        if (!unit) return;

        const CARD_W = 100;
        const CARD_H = 100;
        const R = 8;
        const SPOUSE_GAP = 20;

        // Для супружеской пары
        if (unit.type === 'couple') {
          unit.partners.forEach((partner, i) => {
            if (!partner) return;
            
            const offsetX = i === 0 ? -CARD_W - SPOUSE_GAP/2 : SPOUSE_GAP/2;
            
            // Карточка
            node.append('rect')
              .attr('x', offsetX)
              .attr('y', -CARD_H/2)
              .attr('width', CARD_W)
              .attr('height', CARD_H)
              .attr('rx', R)
              .attr('ry', R)
              .attr('fill', partner.gender === 'Male' ? '#4a90e2' : '#e24a90');
            
            // Инициалы
            const nameParts = [partner.name, partner.surname].filter(Boolean);
            const initials = nameParts.length > 0 
              ? nameParts.map(n => n[0] || '').join('').toUpperCase() 
              : '?';
              
            node.append('text')
              .attr('x', offsetX + CARD_W/2)
              .attr('y', 0)
              .attr('text-anchor', 'middle')
              .attr('dy', '0.35em')
              .style('font-size', '20px')
              .style('fill', '#fff')
              .text(initials);
              
            // Имя
            if (partner.name) {
              node.append('text')
                .attr('x', offsetX + CARD_W/2)
                .attr('y', CARD_H/2 + 15)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .text(partner.name);
            }
              
            // Год рождения
            if (partner.birthdate?.year) {
              node.append('text')
                .attr('x', offsetX + CARD_W/2)
                .attr('y', CARD_H/2 + 30)
                .attr('text-anchor', 'middle')
                .style('font-size', '10px')
                .style('fill', '#666')
                .text(partner.birthdate.year);
            }
          });
          
          // Линия между супругами
          node.append('line')
            .attr('x1', -SPOUSE_GAP/2)
            .attr('y1', 0)
            .attr('x2', SPOUSE_GAP/2)
            .attr('y2', 0)
            .attr('stroke', '#e24a90')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4 2');
        } 
        // Для одиночного человека
        else if (unit.type === 'single' && unit.person) {
          const person = unit.person;
          
          // Карточка
          node.append('rect')
            .attr('x', -CARD_W/2)
            .attr('y', -CARD_H/2)
            .attr('width', CARD_W)
            .attr('height', CARD_H)
            .attr('rx', R)
            .attr('ry', R)
            .attr('fill', person.gender === 'Male' ? '#4a90e2' : '#e24a90');
            
          // Инициалы
          const nameParts = [person.name, person.surname].filter(Boolean);
          const initials = nameParts.length > 0 
            ? nameParts.map(n => n[0] || '').join('').toUpperCase() 
            : '?';
          
          node.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .style('font-size', '20px')
            .style('fill', '#fff')
            .text(initials);
            
          // Имя
          if (person.name) {
            node.append('text')
              .attr('x', 0)
              .attr('y', CARD_H/2 + 15)
              .attr('text-anchor', 'middle')
              .style('font-size', '12px')
              .text(person.name);
          }
            
          // Год рождения
          if (person.birthdate?.year) {
            node.append('text')
              .attr('x', 0)
              .attr('y', CARD_H/2 + 30)
              .attr('text-anchor', 'middle')
              .style('font-size', '10px')
              .style('fill', '#666')
              .text(person.birthdate.year);
          }
        }
      });

      // Центрируем дерево
      const bounds = svg.node().getBBox();
      const dx = bounds.x;
      const dy = bounds.y;
      const w = bounds.width;
      const h = bounds.height;
      
      zoomG.attr('transform', `translate(${width/2 - w/2 - dx},${height/2 - h/2 - dy})`);
    } catch (error) {
      console.error("Error rendering family tree:", error);
    }
  }, [data]);

  return (
    <TreeContainer ref={containerRef}>
      <svg ref={svgRef} />
    </TreeContainer>
  );
};

export default FamilyTreeD3;