/// <reference types="jest-extended" />
import { SankeyTimeline } from '../src';

test('SankeyTimeline', () => {
  const timeline = new SankeyTimeline();

  const v0 = timeline.createNode('v0', 0, 2);
  const v1 = timeline.createNode('v1', 2, 4);
  const v2 = timeline.createNode('v2', 4, 8);
  const v3 = timeline.createNode('v3', 3, 5);
  const v4 = timeline.createNode('v4', 6, 12);
  const v5 = timeline.createNode('v5', 11, 13);
  const a = timeline.createLink(v0, v1, 12);
  const b = timeline.createLink(v1, v2, 10);
  const c = timeline.createLink(v1, v3, 30);
  const d = timeline.createLink(v2, v4, 4);
  const e = timeline.createLink(v3, v2, 1);
  const f = timeline.createLink(v4, v0, 12);
  const g = timeline.createLink(v2, v5, 3);
  const h = timeline.createLink(v5, v5, 2);
  const i = timeline.createLink(v5, v3, 4);
});

/*
test('main', () => {
  const timeline = new SankeyTimeline();
  // Need to set before adding nodes so the rows get calculated properly
  // TODO: make this not the case
  timeline.setRange([10, 790]);
  const v0 = timeline.addNode('v0', 0, 2);
  const v1 = timeline.addNode('v1', 2, 4);
  const v2 = timeline.addNode('v2', 4, 8);
  const v3 = timeline.addNode('v3', 3, 5);
  const v4 = timeline.addNode('v4', 6, 12);
  const v5 = timeline.addNode('v5', 11, 13);
  const a = timeline.addLink(v0, v1, 12);
  const b = timeline.addLink(v1, v2, 10);
  const c = timeline.addLink(v1, v3, 30);
  const d = timeline.addLink(v2, v4, 4);
  const e = timeline.addLink(v3, v2, 1);
  const f = timeline.addLink(v4, v0, 12);
  const g = timeline.addLink(v2, v5, 3);
  const h = timeline.addLink(v5, v5, 2);
  timeline.addLink(v5, v3, 4);
  expect(a.isCircular).toBe(false);
  expect(b.isCircular).toBe(false);
  expect(c.isCircular).toBe(false);
  expect(d.isCircular).toBe(false);
  expect(e.isCircular).toBe(false);
  expect(f.isCircular).toBe(true);
  expect(g.isCircular).toBe(false);
  expect(h.isCircular).toBe(true);
  expect(v0.size).toBe(12);
  expect(v1.size).toBe(40);
  expect(v2.size).toBe(11);
  expect(v3.size).toBe(34);
  expect(v4.size).toBe(12);
  expect(v5.size).toBe(6);
  expect(v0.partOfCircuit).toBe(true);
  expect(v1.partOfCircuit).toBe(false);
  expect(v2.partOfCircuit).toBe(false);
  expect(v3.partOfCircuit).toBe(false);
  expect(v4.partOfCircuit).toBe(true);
  expect(v5.partOfCircuit).toBe(true);
  expect(timeline.minTime).toBe(0);
  expect(timeline.maxTime).toBe(13);
  expect(timeline.findOverlaps(v0).map((o) => o.label)).toIncludeAllMembers([
    'v1',
  ]);
  expect(timeline.findOverlaps(v1).map((o) => o.label)).toIncludeAllMembers([
    'v0',
    'v2',
    'v3',
  ]);
  expect(timeline.findOverlaps(v2).map((o) => o.label)).toIncludeAllMembers([
    'v1',
    'v3',
    'v4',
  ]);
  expect(timeline.findOverlaps(v3).map((o) => o.label)).toIncludeAllMembers([
    'v1',
    'v2',
  ]);
  expect(timeline.findOverlaps(v4).map((o) => o.label)).toIncludeAllMembers([
    'v2',
    'v5',
  ]);
  expect(timeline.findOverlaps(v5).map((o) => o.label)).toIncludeAllMembers([
    'v4',
  ]);
  expect(v0.row).toBe(0);
  expect(v1.row).toBe(1);
  expect(v2.row).toBe(0);
  expect(v3.row).toBe(2);
  expect(v4.row).toBe(1);
  expect(v5.row).toBe(0);
  expect(f.isSelfLinking).toBe(false);
  expect(h.isSelfLinking).toBe(true);
  expect(f.isOnlyCircularLink).toBe(true);
  expect(h.isOnlyCircularLink).toBe(true);
  expect(
    timeline
      .findLinkOverlaps(v0)
      .links.map((o) => [o.source.label, o.target.label]),
  ).toIncludeAllMembers([['v4', 'v0']]);
  expect(
    timeline
      .findLinkOverlaps(v1)
      .links.map((o) => [o.source.label, o.target.label]),
  ).toIncludeAllMembers([
    ['v1', 'v3'],
    ['v3', 'v2'],
  ]);
  expect(
    timeline
      .findLinkOverlaps(v2)
      .links.map((o) => [o.source.label, o.target.label]),
  ).toIncludeAllMembers([
    ['v4', 'v0'],
    ['v2', 'v4'],
  ]);
  expect(
    timeline
      .findLinkOverlaps(v3)
      .links.map((o) => [o.source.label, o.target.label]),
  ).toIncludeAllMembers([
    ['v1', 'v3'],
    ['v5', 'v3'],
  ]);
  expect(
    timeline
      .findLinkOverlaps(v4)
      .links.map((o) => [o.source.label, o.target.label]),
  ).toIncludeAllMembers([
    ['v2', 'v4'],
    ['v5', 'v3'],
    ['v4', 'v0'],
  ]);
  expect(
    timeline
      .findLinkOverlaps(v5)
      .links.map((o) => [o.source.label, o.target.label]),
  ).toIncludeAllMembers([
    ['v5', 'v5'],
    ['v5', 'v3'],
  ]);
});

test('edge cases', () => {
  const timeline = new SankeyTimeline();
  expect(timeline.maxTime).toBe(0);
  expect(timeline.minTime).toBe(0);
  timeline.setRange([0, 100]);
  const zeroWidth = timeline.addNode('zeroWidth', 0, 0);
  expect(zeroWidth.width).toBe(0);
});
*/
