/* eslint-disable new-cap */
/* global d3, sankeyTimeline */

const timeline = new sankeyTimeline.default();
const range = [50, window.innerWidth - 50];
timeline.setRange(range);

let v0;
let v1;
let v2;
let v3;
let v4;
let v5;
const steps = [
  () => {
    v0 = timeline.addNode('v0', 0, 2);
  },
  () => {
    v1 = timeline.addNode('v1', 2, 4);
  },
  () => {
    timeline.addLink(v0, v1, 12);
  },
  () => {
    v2 = timeline.addNode('v2', 4, 8);
  },
  () => {
    timeline.addLink(v1, v2, 10);
  },
  () => {
    v3 = timeline.addNode('v3', 3, 5);
  },
  () => {
    timeline.addLink(v1, v3, 30);
  },
  () => {
    v4 = timeline.addNode('v4', 6, 12);
  },
  () => {
    timeline.addLink(v2, v4, 4);
  },
  () => {
    timeline.addLink(v3, v2, 1);
  },
  () => {
    timeline.addLink(v4, v0, 12);
  },
  () => {
    v5 = timeline.addNode('v5', 11, 13);
  },
  () => {
    timeline.addLink(v2, v5, 3);
  },
  () => {
    timeline.addLink(v5, v5, 2);
  },
  () => {
    timeline.addLink(v5, v3, 4);
  },
];

const animated = false;
const stepTime = 1000;
const maxStep = steps.length;
if (animated) {
  steps[0]();
  let currentStep = 1;
  window.renderDemo(timeline, range);
  const interval = setInterval(() => {
    steps[currentStep]();
    d3.selectAll('svg > *').remove();
    window.renderDemo(timeline, range);
    currentStep += 1;
    if (currentStep === maxStep) {
      clearInterval(interval);
    }
  }, stepTime);
} else {
  for (let currentStep = 0; currentStep < maxStep; currentStep += 1) {
    steps[currentStep]();
  }
  window.renderDemo(timeline, range);
}
