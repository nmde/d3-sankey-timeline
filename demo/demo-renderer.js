/* global d3, sankeyTimeline */

window.renderDemo = function renderDemo(timeline, range) {
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
  let colorIndex = 0;
  const color = d3.interpolateRainbow;
  svg
    .append('g')
    .selectAll('rect')
    .data(graph.nodes)
    .join('rect')
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('height', (d) => d.height)
    .attr('width', (d) => d.width)
    .attr('fill', () => {
      const c = color(colorIndex / graph.nodes.length);
      colorIndex += 1;
      return c;
    })
    .append('title')
    .text((d) => `${d.label}\n${d.size}`);

  // Create links
  const link = svg
    .append('g')
    .attr('fill', 'none')
    .selectAll('g')
    .data(graph.links)
    .join('g')
    .attr('stroke', (d) => d3.color(color(d.source.id / graph.nodes.length)).brighter(0.5))
    .style('mix-blend-mode', 'multiply');

  link
    .append('path')
    .attr('d', (d) => d.path)
    .attr('stroke-width', (d) => Math.max(1, d.width));

  link
    .append('title')
    .text((d) => `${d.source.label} → ${d.target.label}\n${d.flow}`);
};
