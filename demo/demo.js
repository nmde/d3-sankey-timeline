/* eslint-disable new-cap */
/* global d3, sankeyTimeline */

const timeline = new sankeyTimeline.default();
const { data } = window;

const nodes = {};
const links = {};

/**
 * Converts the timestamp string from the data into a number of seconds since the start.
 *
 * @param timestamp - The timestamp to convert.
 * @returns The number of seconds since 0 of the timestamp.
 */
function timestampToSeconds(timestamp) {
  const t = timestamp.split(':').map((x) => Number(x));
  return t[2] + t[1] * 60 + t[0] * 3600;
}

/**
 * Process a step in a path.
 *
 * @param path - The focused path object.
 * @param paths - All paths.
 */
function processPath(path, paths) {
  if (!nodes[path.name]) {
    nodes[path.name] = path;
  }
  if (!links[path.name]) {
    links[path.name] = [];
  }
  path.exits.forEach((exitPath) => {
    if (links[path.name].indexOf(exitPath.otherState) < 0) {
      links[path.name].push(exitPath.otherState);
    }
    processPath(
      paths.find((p) => p.name === exitPath.otherState),
      paths,
    );
  });
}

// Find nodes and link sin the data.
data.keyStates.forEach((keyState) => {
  processPath(
    keyState.paths.find((path) => path.entries.length === 0),
    keyState.paths,
  );
});

// Create corresponding nodes timeline.
Object.keys(nodes).forEach((n) => {
  const node = nodes[n];
  nodes[n].timelineNode = timeline.addNode(
    node.name,
    timestampToSeconds(node.timeMin),
    timestampToSeconds(node.timeMax),
  );
});

// Now that the TimelineNodes have been created, create links between them.
Object.keys(nodes).forEach((n) => {
  links[n].forEach((link) => {
    timeline.addLink(nodes[n].timelineNode, nodes[link].timelineNode, 1);
  });
});

console.log(timeline);
const range = [20, window.innerWidth - 20];
timeline.setRange(range);
const graph = timeline.getGraph();

// Create the graph element
const svg = d3
  .select('svg')
  .style('background', '#fff')
  .style('width', '100%')
  .style('height', '100%');

// Use d3-axis to create an axis
svg
  .append('g')
  .style('width', '100%')
  .call(
    d3.axisBottom(
      d3
        .scaleLinear()
        .domain([timeline.minTime, timeline.maxTime])
        .range(range),
    ),
  );

// Create nodes
const color = '#dddddd';
svg
  .append('g')
  .selectAll('rect')
  .data(graph.nodes)
  .join('rect')
  .attr('x', (d) => d.x)
  .attr('y', (d) => d.y)
  .attr('height', (d) => d.height)
  .attr('width', (d) => d.width)
  .attr('fill', (d) => {
    let c;
    /*
    d.sourceLinks.forEach((link) => {
      if (c === undefined) c = link.color;
      else if (c !== link.color) c = null;
    });
    if (c === undefined) {
      d.targetLinks.forEach((link) => {
        if (c === undefined) c = link.color;
        else if (c !== link.color) c = null;
      });
    }
    */
    return (d3.color(c) || d3.color(color)).darker(0.5);
  })
  .append('title')
  .text((d) => `${d.label}\n${d.size}`);
