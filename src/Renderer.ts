import { axisBottom } from 'd3-axis';
import { color } from 'd3-color';
import { interpolateHsl } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import SankeyTimeline from './SankeyTimeline';

/**
 * Renders the chart using D3.
 */
export default class Renderer {
  public timeline: SankeyTimeline;

  /**
   * Constructs Renderer.
   *
   * @param timeline - The timeline to render.
   */
  public constructor(timeline: SankeyTimeline) {
    this.timeline = timeline;
  }

  /**
   * Renders the graph.
   */
  public render(): void {
    /// TODO: Add options to customize the render.
    const graph = this.timeline.getGraph();

    // Create the graph element
    const svg = select('svg')
      .style('background', '#fff')
      .style('width', '100%')
      .style('height', '100%');

    // Use d3-axis to create an axis
    svg
      .append('g')
      .style('width', '100%')
      .call(
        axisBottom(
          scaleLinear()
            .domain([this.timeline.minTime, this.timeline.maxTime])
            .range(this.timeline.range),
        ),
      );

    // Create nodes
    let colorIndex = 0;
    const gradient = interpolateHsl(
      color('purple') as d3.HSLColor,
      color('orange') as d3.HSLColor,
    );
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
        const c = gradient(colorIndex / graph.nodes.length);
        colorIndex += 1;
        return c;
      });

    // Create links
    const link = svg
      .append('g')
      .attr('fill', 'none')
      .selectAll('g')
      .data(graph.links)
      .join('g')
      .attr('stroke', (d) =>
        (color(gradient(d.source.id / graph.nodes.length)) as d3.RGBColor)
          .brighter(0.5)
          .toString())
      .style('mix-blend-mode', 'multiply');

    link
      .append('path')
      .attr('d', (d) => d.path)
      .attr('stroke-width', (d) => Math.max(1, d.width));

    link
      .append('title')
      .text((d) => `${d.source.label} → ${d.target.label}\n${d.flow}`);

    // Create labels
    svg
      .append('g')
      .selectAll('text')
      .data(graph.nodes)
      .join('text')
      .attr('x', (d) => d.x + d.width / 2)
      .attr('y', (d) => d.y + d.height / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('fill', 'white')
      .style('font-size', '25px')
      .text((d) => d.label);
  }
}
