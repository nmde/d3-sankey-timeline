/* global sankeyTimeline */

const timeline = new sankeyTimeline.SankeyTimeline();
const { data } = window;
const renderer = new sankeyTimeline.Renderer(timeline);
renderer.options.height = 700;
renderer.options.dynamicNodeHeight = true;

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
    if (
      links[path.name].map((link) => link.name).indexOf(exitPath.otherState) < 0
    ) {
      links[path.name].push({
        count: exitPath.cnt,
        name: exitPath.otherState,
      });
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
  nodes[n].timelineNode = timeline.createNode(node.name, {
    endTime: timestampToSeconds(node.timeMax),
    meanTime: timestampToSeconds(node.timeMean),
    startTime: timestampToSeconds(node.timeMin),
    stdDeviation: timestampToSeconds(node.timeStdDeviation),
  });
});

// Now that the TimelineNodes have been created, create links between them.
Object.keys(nodes).forEach((n) => {
  links[n].forEach((link) => {
    timeline.createLink(
      nodes[n].timelineNode,
      nodes[link.name].timelineNode,
      link.count,
    );
  });
});

renderer.render(timeline);
