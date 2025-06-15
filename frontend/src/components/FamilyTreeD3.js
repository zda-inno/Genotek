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

  // 1) Создаем семейные юниты (couple/single) и привязку детей, затем объединяем многобрачие
  const createFamilyUnits = (people) => {
    if (!people || !people.length) return { units: new Map(), personToUnitsMap: new Map() };

    const personMap = new Map(people.map(p => [p.person_id, p]));
    const units = new Map();
    const personToUnitsMap = new Map();
    people.forEach(person => personToUnitsMap.set(person.person_id, []));

    // Супружеские пары
    people.forEach(person => {
      const spouses = person.relatives?.filter(r => r.relationType === 'spouse') || [];
      spouses.forEach(rel => {
        const sp = personMap.get(rel.person_id);
        if (!sp) return;
        const id = [person.person_id, sp.person_id].sort().join('_');
        if (!units.has(id)) {
          const unit = { id, type: 'couple', partners: [person, sp], children: new Set() };
          units.set(id, unit);
          personToUnitsMap.get(person.person_id).push(unit);
          personToUnitsMap.get(sp.person_id).push(unit);
        }
      });
    });

    // Одиночки
    people.forEach(person => {
      if (personToUnitsMap.get(person.person_id).length === 0) {
        const unit = { id: person.person_id, type: 'single', person, children: new Set() };
        units.set(person.person_id, unit);
        personToUnitsMap.get(person.person_id).push(unit);
      }
    });

    // Дети
    people.forEach(person => {
      const parents = person.relatives?.filter(r => r.relationType === 'parent').map(r => r.person_id) || [];
      if (!parents.length) return;
      let target;
      if (parents.length === 1) {
        const up = personToUnitsMap.get(parents[0]);
        target = up.find(x => x.type === 'single') || up[0];
      } else {
        const pid = parents.sort().join('_');
        target = units.get(pid);
        if (!target) {
          const [p1, p2] = parents;
          const newU = { id: pid, type: 'couple', partners: [personMap.get(p1), personMap.get(p2)], children: new Set() };
          units.set(pid, newU);
          personToUnitsMap.get(p1).push(newU);
          personToUnitsMap.get(p2).push(newU);
          target = newU;
        }
      }
      if (target) target.children.add(person.person_id);
    });

    // Объединяем все браки одного человека в один юнит
    for (const [pid, ulist] of personToUnitsMap.entries()) {
      const spouseUnits = ulist.filter(u => u.type === 'couple');
      if (spouseUnits.length <= 1) continue;

      const main = spouseUnits[0];
      const allIds = new Set([pid]);
      spouseUnits.forEach(u => u.partners.forEach(p => allIds.add(p.person_id)));

      main.partners = Array.from(allIds).map(id => personMap.get(id));
      const combinedChildren = new Set();
      spouseUnits.forEach(u => u.children.forEach(ch => combinedChildren.add(ch)));
      main.children = combinedChildren;

      // Удаляем лишние юниты
      for (let i = 1; i < spouseUnits.length; i++) {
        const u = spouseUnits[i];
        units.delete(u.id);
        u.partners.forEach(p => {
          const arr = personToUnitsMap.get(p.person_id);
          const idx = arr.indexOf(u);
          if (idx >= 0) arr.splice(idx, 1);
        });
      }

      units.delete(main.id);
      const newId = Array.from(allIds).sort().join('_');
      main.id = newId;
      units.set(newId, main);
    }

    return { units, personToUnitsMap };
  };

  // 2) Строим иерархию с невидимым корнем
  const buildHierarchy = (units, personToUnitsMap) => {
    if (!units.size) return { id: '__ROOT__', children: [] };

    const childrenMap = new Map();
    const parentMap = new Map();

    // связи родитель → ребёнок
    for (const [uid, u] of units) {
      u.children.forEach(pid => {
        const cUnits = personToUnitsMap.get(pid) || [];
        if (!cUnits.length) return;
        const childUnit = cUnits.find(x => x.type === 'single') || cUnits[0];
        childrenMap.set(uid, [...(childrenMap.get(uid) || []), childUnit.id]);
        parentMap.set(childUnit.id, [...(parentMap.get(childUnit.id) || []), uid]);
      });
    }

    // все корневые юниты без родителей прикрепляем к __ROOT__
    const roots = Array.from(units.keys()).filter(id => !parentMap.has(id));

    const buildNode = id => {
      const u = units.get(id);
      if (!u) return null;
      const nd = { id, unitData: u, children: [] };
      (childrenMap.get(id) || []).forEach(cid => {
        const cn = buildNode(cid);
        if (cn) nd.children.push(cn);
      });
      return nd;
    };

    return {
      id: '__ROOT__',
      children: roots.map(r => buildNode(r)).filter(Boolean)
    };
  };

  useEffect(() => {
    if (!data?.length || !svgRef.current || !containerRef.current) return;
    const { units, personToUnitsMap } = createFamilyUnits(data);
    const hierarchyData = buildHierarchy(units, personToUnitsMap);
    const root = d3.hierarchy(hierarchyData);

    const { clientWidth: w, clientHeight: h } = containerRef.current;
    const svg = d3.select(svgRef.current)
      .attr('width', w)
      .attr('height', h)
      .call(d3.zoom().scaleExtent([0.1, 5]).on('zoom', e => zoomG.attr('transform', e.transform)));

    svg.selectAll('*').remove();
    const zoomG = svg.append('g');
    const g = zoomG.append('g').attr('transform', 'translate(50,50)');

    const treeLayout = d3.tree().nodeSize([350, 200]).separation((a, b) => a.parent === b.parent ? 1.2 : 2.0);
    const treeData = treeLayout(root);

    // ссылки (рисуем все, у которых target.depth>0)
    g.selectAll('.link')
      .data(treeData.links().filter(d => d.target.depth > 0))
      .enter().append('path')
        .attr('class', 'link')
        .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y))
        .attr('stroke', '#aaa').attr('fill', 'none').attr('stroke-width', 2);

    // узлы (скрываем только корень)
    const nodes = g.selectAll('.node')
      .data(treeData.descendants().filter(d => d.depth > 0 && d.data.unitData), d => d.data.id)
      .enter().append('g').attr('class', 'node').attr('transform', d => `translate(${d.x},${d.y})`);

    nodes.each(function(d) {
      const node = d3.select(this);
      const u = d.data.unitData;
      const CW = 70, CH = 70, R = 8, G = 30;
      const total = CW + G;
      const partners = u.type === 'couple' ? u.partners : [u.person];
      const n = partners.length;

      partners.forEach((p, i) => {
        const offset = (i - (n - 1) / 2) * total;
        const rectX = offset - CW / 2;
        node.append('rect')
          .attr('x', rectX).attr('y', -CH/2)
          .attr('width', CW).attr('height', CH)
          .attr('rx', R).attr('ry', R)
          .attr('fill', (p.gender === 'Male') ? '#4a90e2' : '#e24a90');
        node.append('text')
          .attr('x', offset).attr('y', 0)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '18px').style('fill', '#fff')
          .text(`${p.name?.[0]||''}${p.surname?.[0]||''}`);
        node.append('text')
          .attr('x', offset).attr('y', CH/2 + 20)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px').style('fill', '#000')
          .text(p.name || '');
        if (p.surname) node.append('text')
          .attr('x', offset).attr('y', CH/2 + 40)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px').style('fill', '#000')
          .text(p.surname);
        if (p.birthdate?.year) node.append('text')
          .attr('x', offset).attr('y', CH/2 + 60)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px').style('fill', '#000')
          .text(p.birthdate.year);
      });

      // линии между партнёрами
      if (n > 1) {
        for (let i = 0; i < n - 1; i++) {
          const x1 = (i - (n - 1)/2) * total + CW/2;
          const x2 = ((i + 1) - (n - 1)/2) * total - CW/2;
          node.append('line')
            .attr('x1', x1).attr('y1', 0)
            .attr('x2', x2).attr('y2', 0)
            .attr('stroke', 'red').attr('stroke-width', 2);
        }
      }
    });

    // центрируем
    const bb = svg.node().getBBox();
    zoomG.attr('transform', `translate(${w/2 - bb.width/2 - bb.x},${h/2 - bb.height/2 - bb.y})`);
  }, [data]);

  return (
    <TreeContainer ref={containerRef}>
      <svg ref={svgRef} />
    </TreeContainer>
  );
};

export default FamilyTreeD3;
