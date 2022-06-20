import { axisBottom } from 'd3-axis';
import { color, HSLColor, RGBColor } from 'd3-color';
import { interpolateHsl } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { bezierBezierIntersectionFast, evalDeCasteljau } from 'flo-bezier3';
import SankeyTimeline from './SankeyTimeline';
import type { TimelineGraph } from './types';

/**
 * Renders the chart using D3.
 */
export default class Renderer {
  private graph: TimelineGraph = {
    links: [],
    nodes: [],
  };

  public options = {
    curveHeight: 50,
    curveWidth: 200,
    dynamicLinkWidth: true,
    dynamicNodeHeight: false,
    endColor: 'orange',
    fontColor: 'white',
    fontSize: 25,
    maxLinkWidth: 100,
    maxNodeHeight: 100,
    startColor: 'purple',
  };

  public range: [number, number];

  public timeline: SankeyTimeline;

  /**
   * Constructs Renderer.
   *
   * @param timeline - The timeline to render.
   * @param range - The range of device pixels to render over (within the SVG).
   */
  public constructor(timeline: SankeyTimeline, range: [number, number]) {
    this.timeline = timeline;
    this.range = range;
  }

  /**
   * Calculates timeline link paths based on node's X and Y coordinates.
   */
  private calculateLinkPaths(): void {
    this.graph.links.forEach((link, l) => {
      const y = link.source.layout.y + link.source.layout.height / 2;
      const y1 = link.target.layout.y + link.target.layout.height / 2;
      const curve = [
        [link.source.layout.x + link.source.layout.width, y],
        [
          link.source.layout.x +
            link.source.layout.width +
            this.options.curveWidth,
          y,
        ],
        [link.target.layout.x - this.options.curveWidth, y1],
        [link.target.layout.x, y1],
      ];
      let path;
      if (link.isCircular) {
        path = `M${link.source.layout.x + link.source.layout.width - 5},${y}C${
          link.source.layout.x +
          link.source.layout.width +
          this.options.curveWidth
        },${y - this.options.curveHeight},${
          link.target.layout.x - this.options.curveWidth
        },${y1 - this.options.curveHeight},${link.target.layout.x + 5},${y1}`;
      } else {
        // TODO: Have curveHeight option effect non-circular curve paths
        // TODO: If the curve width is larger than the nodes it connects to,
        // adjust the curve to be the size of the node at the connection point
        path = `M${curve[0][0]},${curve[0][1]}C${curve[1][0]},${curve[1][1]},${curve[2][0]},${curve[2][1]},${curve[3][0]},${curve[3][1]}`;
      }
      let width = this.options.maxLinkWidth;
      if (this.timeline.maxFlow !== 0 && this.options.dynamicLinkWidth) {
        width *= link.flow / this.timeline.maxFlow;
      }
      this.graph.links[l].layout = {
        curve,
        path,
        width,
      };
      return l;
    });
  }

  /**
   * Given the bounds of the container to render in,
   * construct a clone of the graph with all measurements adjusted to fit in the given range.
   *
   * @returns A graph object with layout properties assigned to nodes and links.
   */
  public calculateLayout(): TimelineGraph {
    this.graph = this.timeline.graph;
    // First pass - initial placements based only on instrinsic properties
    this.graph.nodes.forEach((node, n) => {
      const x =
        (this.range[1] - this.range[0]) *
          (node.startTime / (this.timeline.maxTime - this.timeline.minTime)) +
        this.range[0];
      let width =
        (this.range[1] - this.range[0]) *
          (node.endTime / (this.timeline.maxTime - this.timeline.minTime)) +
        this.range[0] -
        x;
      if (Number.isNaN(width)) {
        width = 0;
      }
      let height = this.options.maxNodeHeight;
      if (this.options.dynamicNodeHeight) {
        height *= node.size / this.timeline.maxSize;
      }
      this.graph.nodes[n].layout = {
        height,
        width,
        x,
        y: 0,
      };
    });
    // Second pass - Adjust X and Y coordinates to try and minimize overlapping nodes
    this.preventNodeOverlaps();
    // Calculate initial link positions
    this.calculateLinkPaths();
    // Third pass - Adjust nodes to prevent nodes from overlapping with links
    this.preventLinkOverlaps();
    // Then, prevent the new node positions from overlapping with each other
    this.preventNodeOverlaps();
    // Finally, recalculate the link paths for the final node coordinates
    this.calculateLinkPaths();
    return this.graph;
  }

  /**
   * Adjusts nodes to prevent overlaps between nodes and links.
   */
  private preventLinkOverlaps() {
    this.graph.nodes.forEach((node, n) => {
      const topLeft = [node.layout.x, node.layout.y];
      const topRight = [node.layout.x + node.layout.width, node.layout.y];
      const bottomLeft = [node.layout.x, node.layout.y + node.layout.height];
      const bottomRight = [
        node.layout.x + node.layout.width,
        node.layout.y + node.layout.height,
      ];
      const linkOverlaps: number[] = [];
      const intersections: number[][][][] = [];
      const linkOverlapDirections: number[] = [];
      Object.values(this.graph.links).forEach((link) => {
        [
          [topLeft, topLeft, topRight, topRight],
          [topRight, topRight, bottomRight, bottomRight],
          [bottomRight, bottomRight, bottomLeft, bottomLeft],
          [bottomLeft, bottomLeft, topLeft, topLeft],
        ].forEach((curve) => {
          [
            link.layout.curve.map((x) =>
              x.map((y) => y - link.layout.width / 2)),
            link.layout.curve.map((x) =>
              x.map((y) => y + link.layout.width / 2)),
          ].forEach((c) => {
            const i = bezierBezierIntersectionFast(curve, c);
            if (i.length > 0 && linkOverlaps.indexOf(link.id) < 0) {
              linkOverlaps.push(link.id);
              linkOverlapDirections.push(
                link.source.layout.y - link.target.layout.y,
              );
              intersections.push(
                i.map((j) => j.map((k) => evalDeCasteljau(c, k))),
              );
            }
          });
        });
      });
      let maxY = node.layout.y;
      const incomingLinks = node.incomingLinks.map((link) => link.id);
      intersections.forEach((overlaps, i) => {
        overlaps.forEach((curve) => {
          curve
            .map((p) => p.map((q) => Number(q.toFixed(2))))
            .forEach((point) => {
              if (
                point[1] > maxY &&
                linkOverlapDirections[i] < 0 &&
                incomingLinks.indexOf(linkOverlaps[i]) >= 0
              ) {
                [, maxY] = point;
              }
            });
        });
      });
      this.graph.nodes[n].layout.y = maxY;
    });
  }

  /**
   * Adjusts nodes so they don't overlap with other nodes.
   */
  private preventNodeOverlaps() {
    this.graph.nodes.forEach((node, n) => {
      const overlapRanges: number[][] = [];
      this.graph.nodes.forEach((o, m) => {
        if (
          m < n &&
          ((o.layout.x + o.layout.width >= node.layout.x &&
            o.layout.x <= node.layout.x) ||
            (node.layout.x + node.layout.width >= o.layout.x &&
              node.layout.x <= o.layout.x))
        ) {
          overlapRanges.push([o.layout.y, o.layout.y + o.layout.height]);
        }
      });
      let minY = node.layout.y;
      overlapRanges
        .sort((a, b) => a[0] - b[0])
        .forEach((overlap) => {
          if (minY >= overlap[0] && minY <= overlap[1]) {
            [, minY] = overlap;
          }
        });
      this.graph.nodes[n].layout.y = minY;
    });
  }

  /**
   * Renders the graph.
   */
  public render(): void {
    const graph = this.calculateLayout();

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
            .range(this.range),
        ),
      );

    // Create nodes
    let colorIndex = 0;
    const gradient = interpolateHsl(
      color(this.options.startColor) as HSLColor,
      color(this.options.endColor) as HSLColor,
    );
    svg
      .append('g')
      .selectAll('rect')
      .data(graph.nodes)
      .join('rect')
      .attr('x', (d) => d.layout.x)
      .attr('y', (d) => d.layout.y)
      .attr('height', (d) => d.layout.height)
      .attr('width', (d) => d.layout.width)
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
        (
          color(gradient(d.source.id / graph.nodes.length)) as RGBColor
        ).toString())
      .style('mix-blend-mode', 'multiply');

    link
      .append('path')
      .attr('d', (d) => d.layout.path)
      .attr('stroke-width', (d) => Math.max(1, d.layout.width));

    link
      .append('title')
      .text((d) => `${d.source.label} → ${d.target.label}\n${d.flow}`);

    // Create labels
    svg
      .append('g')
      .selectAll('text')
      .data(graph.nodes)
      .join('text')
      .attr('x', (d) => d.layout.x + d.layout.width / 2)
      .attr('y', (d) => d.layout.y + d.layout.height / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('fill', this.options.fontColor)
      .style('font-size', `${this.options.fontSize}px`)
      .text((d) => d.label);
  }
}
