/* eslint-disable new-cap */
/* global sankeyTimeline */

const timeline = new sankeyTimeline.default();
const { data } = window;

const nodes = {};
const links = {};

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
    node.timeMin,
    node.timeMax,
  );
});

// Now that the TimelineNodes have been created, create links between them.
Object.keys(nodes).forEach((n) => {
  links[n].forEach((link) => {
    timeline.addLink(nodes[n].timelineNode, nodes[link].timelineNode, 1);
  });
});

console.log(timeline);
