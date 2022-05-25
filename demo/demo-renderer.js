/* global d3 */

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
};
