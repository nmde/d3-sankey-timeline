/* eslint-disable new-cap */
/* global sankeyTimeline */

const timeline = new sankeyTimeline.default();
const v0 = timeline.addNode('v0', 0, 2);
const v1 = timeline.addNode('v1', 2, 4);
const v2 = timeline.addNode('v2', 4, 8);
const v3 = timeline.addNode('v3', 3, 5);
const v4 = timeline.addNode('v4', 6, 12);
const v5 = timeline.addNode('v5', 11, 13);
const a = timeline.addLink(v0, v1, 1);
const b = timeline.addLink(v1, v2, 10);
const c = timeline.addLink(v1, v3, 30);
const d = timeline.addLink(v2, v4, 4);
const e = timeline.addLink(v3, v2, 1);
const f = timeline.addLink(v4, v0, 12);
const g = timeline.addLink(v2, v5, 3);
const h = timeline.addLink(v5, v5, 2);
const range = [0, window.innerWidth - 10];
timeline.setRange(range);

window.renderDemo(timeline, range);
