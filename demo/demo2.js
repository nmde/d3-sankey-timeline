/* global d3, sankeyTimeline */

const timeline = new sankeyTimeline.SankeyTimeline();
const margin = 100;
const range = [margin, window.innerWidth - margin];
const renderer = new sankeyTimeline.Renderer(timeline, range);
renderer.options.maxLinkWidth = 50;
renderer.options.dynamicLinkWidth = true;
renderer.options.curveWidth = 100;

let v0;
let v1;
let v2;
let v3;
let v4;
let v5;
const steps = [
  () => {
    v0 = timeline.createNode('v0', 0, 2);
  },
  () => {
    v1 = timeline.createNode('v1', 2, 4);
  },
  () => {
    timeline.createLink(v0, v1, 12);
  },
  () => {
    v2 = timeline.createNode('v2', 4, 8);
  },
  () => {
    timeline.createLink(v1, v2, 10);
  },
  () => {
    v3 = timeline.createNode('v3', 3, 5);
  },
  () => {
    timeline.createLink(v1, v3, 30);
  },
  () => {
    v4 = timeline.createNode('v4', 6, 12);
  },
  () => {
    timeline.createLink(v2, v4, 4);
  },
  () => {
    timeline.createLink(v3, v2, 1);
  },
  () => {
    // timeline.createLink(v4, v0, 12);
  },
  () => {
    v5 = timeline.createNode('v5', 11, 13);
  },
  () => {
    timeline.createLink(v2, v5, 3);
  },
  () => {
    timeline.createLink(v5, v5, 2);
  },
  () => {
    timeline.createLink(v5, v3, 4);
  },
];

const animated = false;
const stepTime = 1000;
const maxStep = steps.length;
if (animated) {
  steps[0]();
  let currentStep = 1;
  renderer.render();
  const interval = setInterval(() => {
    console.log(`Step ${currentStep}`);
    steps[currentStep]();
    d3.selectAll('svg > *').remove();
    renderer.render();
    if (currentStep === maxStep) {
      clearInterval(interval);
    }
    currentStep += 1;
  }, stepTime);
} else {
  for (let currentStep = 0; currentStep < maxStep; currentStep += 1) {
    steps[currentStep]();
  }
  renderer.render();
}
