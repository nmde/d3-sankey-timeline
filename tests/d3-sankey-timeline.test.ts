/// <reference types="jest-extended" />
import SankeyTimeline from '../src';

test('circular links', () => {
  const timeline = new SankeyTimeline();
  const v0 = timeline.addNode('v0', 0, 5);
  const v1 = timeline.addNode('v1', 0, 10);
  const v2 = timeline.addNode('v2', 2, 3);
  const v3 = timeline.addNode('v3', 4, 11);
  const v4 = timeline.addNode('v4', 10, 20);
  const v5 = timeline.addNode('v5', 1, 3);
  const a = timeline.addLink(v0, v1, 1);
  const b = timeline.addLink(v1, v2, 10);
  const c = timeline.addLink(v1, v3, 30);
  const d = timeline.addLink(v2, v4, 4);
  const e = timeline.addLink(v3, v2, 1);
  const f = timeline.addLink(v4, v0, 12);
  const g = timeline.addLink(v4, v5, 3);
  expect(a.isCircular).toBe(false);
  expect(b.isCircular).toBe(false);
  expect(c.isCircular).toBe(false);
  expect(d.isCircular).toBe(false);
  expect(e.isCircular).toBe(false);
  expect(f.isCircular).toBe(true);
  expect(g.isCircular).toBe(false);
  expect(v0.size).toBe(12);
  expect(v1.size).toBe(40);
  expect(v2.size).toBe(11);
  expect(v3.size).toBe(30);
  expect(v4.size).toBe(15);
  expect(v5.size).toBe(3);
  expect(v0.partOfCircuit).toBe(true);
  expect(v1.partOfCircuit).toBe(false);
  expect(v2.partOfCircuit).toBe(false);
  expect(v3.partOfCircuit).toBe(false);
  expect(v4.partOfCircuit).toBe(true);
  expect(v5.partOfCircuit).toBe(false);
});
