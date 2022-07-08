import { axisBottom } from 'd3-axis';
import { color, HSLColor, RGBColor } from 'd3-color';
import { interpolateHsl } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { bezierBezierIntersectionFast, evalDeCasteljau } from 'flo-bezier3';
import SankeyTimeline from './SankeyTimeline';
import TimelineNode from './TimelineNode';
import type { TimelineGraph } from './types';
import { getKeyTimes, hasDist } from './util';

/**
 * Renders the chart using D3.
 */
export default class Renderer {
  private graph: TimelineGraph = {
    links: [],
    nodes: [],
  };

  private minY = 0;

  public options = {
    curveHeight: 50,
    curveWidth: 200,
    distHandleWidth: 3,
    distributions: true,
    dynamicLinkWidth: true,
    dynamicNodeHeight: false,
    endColor: 'orange',
    fontColor: 'white',
    fontSize: 25,
    height: window.innerHeight,
    layout: 'default',
    margin: 100,
    maxLinkWidth: 50,
    maxNodeHeight: 100,
    startColor: 'purple',
    width: window.innerWidth,
  };

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
      if (link.isSelfLinking) {
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
   * Calculates the distribution data layout for nodes in the graph.
   */
  private calculateDistributionLayout() {
    this.graph.nodes.forEach((node) => {
      if (hasDist(node.times) && this.options.distributions) {
        node.layout.distribution = [
          {
            x: this.getTimeX(node.times.startTime),
            y: node.layout.y,
          },
          {
            x: this.getTimeX(node.times.endTime),
            y: node.layout.y,
          },
        ];
      }
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
    if (this.options.layout === 'fixed') {
      this.initializeLayout();
      const rows: TimelineNode[][] = [];
      const placed: number[] = [];
      this.graph.nodes.forEach((node) => {
        if (placed.indexOf(node.id) < 0) {
          rows.push([]);
          this.findNodeOverlaps(node)
            .map((overlap) => overlap.node)
            .forEach((o) => {
              rows[rows.length - 1].push(o);
              placed.push(o.id);
            });
        }
      });
      rows.forEach((row) => {
        const columnHeight = this.options.height / row.length;
        for (let col = 0; col < row.length; col += 1) {
          this.graph.nodes[row[col].id].layout.y = col * columnHeight;
        }
      });
      this.calculateLinkPaths();
      this.calculateDistributionLayout();
      return this.graph;
    }
    this.minY = 0;
    // First pass - initial placements based only on instrinsic properties
    // TODO - save x1 in layout
    this.initializeLayout();
    // Second pass - Adjust X and Y coordinates to try and minimize overlapping nodes
    this.preventNodeOverlaps();
    // Calculate initial link positions
    this.calculateLinkPaths();
    // Third pass - Adjust nodes to prevent nodes from overlapping with links
    this.preventLinkOverlaps();
    // Prevent overlaps with the new positions
    this.preventNodeOverlaps();
    // Fourth pass - Keep nodes from going off the screen and add additional graph elements
    let maxY = 0;
    this.graph.nodes.forEach((node) => {
      node.layout.y -= this.minY;
      if (node.layout.y + node.layout.height > maxY) {
        maxY = node.layout.y + node.layout.height;
      }
    });
    this.graph.nodes.forEach((node) => {
      node.layout.y = this.options.height * (node.layout.y / maxY);
      if (node.layout.y + node.layout.height > this.options.height) {
        node.layout.y = this.options.height - node.layout.height;
      }
    });
    this.calculateDistributionLayout();
    // Calculate final link positions
    this.calculateLinkPaths();
    return this.graph;
  }

  /**
   * Calculates the points at which links cross into nodes.
   *
   * @param node - The node to find overlaps for.
   * @returns The intersecting points.
   */
  private findLinkOverlaps(node: TimelineNode) {
    const topLeft = [node.layout.x, node.layout.y];
    const topRight = [node.layout.x + node.layout.width, node.layout.y];
    const bottomLeft = [node.layout.x, node.layout.y + node.layout.height];
    const bottomRight = [
      node.layout.x + node.layout.width,
      node.layout.y + node.layout.height,
    ];
    const linkOverlaps: number[] = [];
    const intersections: number[][][][] = [];
    Object.values(this.graph.links)
      // TODO: handle self linking?
      .filter((link) => !link.isSelfLinking)
      .forEach((link) => {
        [
          [topLeft, topLeft, topRight, topRight],
          [bottomRight, bottomRight, bottomLeft, bottomLeft],
        ].forEach((boxCurve) => {
          [
            link.layout.curve.map((point) => [
              point[0] - link.layout.width / 2,
              point[1],
            ]),
            link.layout.curve.map((point) => [
              point[0] + link.layout.width / 2,
              point[1],
            ]),
          ].forEach((linkCurve) => {
            const i = bezierBezierIntersectionFast(boxCurve, linkCurve);
            if (i.length > 0 && linkOverlaps.indexOf(link.id) < 0) {
              linkOverlaps.push(link.id);
              intersections.push(
                i.map((j) => j.map((k) => evalDeCasteljau(boxCurve, k))),
              );
            }
          });
        });
      });
    return intersections;
  }

  /**
   * Finds nodes that overlap with the given node.
   *
   * @param node - The node to find overlaps for.
   * @param strict - If true, borders touching will be considered an overlap.
   * @returns Other nodes that overlap with the given node.
   */
  private findNodeOverlaps(node: TimelineNode, strict = true) {
    const overlaps: { node: TimelineNode; range: [number, number] }[] = [];
    this.graph.nodes.forEach((o) => {
      if (
        (strict &&
          ((o.layout.x + o.layout.width >= node.layout.x &&
            o.layout.x <= node.layout.x) ||
            (node.layout.x + node.layout.width >= o.layout.x &&
              node.layout.x <= o.layout.x))) ||
        (!strict &&
          ((o.layout.x + o.layout.width > node.layout.x &&
            o.layout.x <= node.layout.x) ||
            (node.layout.x + node.layout.width > o.layout.x &&
              node.layout.x <= o.layout.x)))
      ) {
        overlaps.push({
          node: o,
          range: [o.layout.y, o.layout.y + o.layout.height],
        });
      }
    });
    return overlaps;
  }

  /**
   * Places nodes in their initial positions.
   */
  private initializeLayout() {
    this.graph.nodes.forEach((node, n) => {
      let keyTimes = [node.times.startTime, node.times.endTime];
      if (this.options.distributions) {
        keyTimes = getKeyTimes(node.times);
      }
      const x = this.getTimeX(keyTimes[0]);
      let width = this.getTimeX(keyTimes[1]) - x;
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
  }

  /**
   * Adjusts nodes to prevent overlaps between nodes and links.
   */
  private preventLinkOverlaps() {
    this.graph.nodes.forEach((node, n) => {
      let shiftUp = 0;
      let shiftDown = 0;
      this.findLinkOverlaps(node).forEach((overlaps) => {
        overlaps.forEach((curve) => {
          curve
            .map((p) => p.map((q) => Number(q.toFixed(2))))
            .forEach((point) => {
              if (point[1] < node.layout.y + node.layout.height / 2) {
                shiftUp += node.layout.y + node.layout.height / 2 - point[1];
              } else if (point[1] > node.layout.y + node.layout.height / 2) {
                shiftDown += node.layout.y + node.layout.height / 2 + point[1];
              } else {
                // console.log(point);
              }
            });
        });
      });
      this.graph.nodes[n].layout.y += shiftUp - shiftDown;
    });
  }

  /**
   * Adjusts nodes so they don't overlap with other nodes.
   */
  private preventNodeOverlaps() {
    this.graph.nodes.forEach((node, n) => {
      // TODO: m < n
      let minY = node.layout.y;
      this.findNodeOverlaps(node)
        .map((overlap) => overlap.range)
        .sort((a, b) => a[0] - b[0])
        .forEach((overlap) => {
          if (minY >= overlap[0] && minY <= overlap[1]) {
            [, minY] = overlap;
          }
        });
      this.graph.nodes[n].layout.y = minY;
      if (minY < this.minY) {
        this.minY = minY;
      }
    });
  }

  /**
   * The chart range.
   *
   * @returns The chart range.
   */
  private get range(): [number, number] {
    return [this.options.margin, this.options.width - this.options.margin];
  }

  /**
   * Renders the graph.
   *
   * @param svg - The SVG element to render within.
   */
  public render(svg: ReturnType<typeof select>): void {
    const graph = this.calculateLayout();

    // Create the graph element
    svg
      .style('background', '#fff')
      .style('width', this.options.width)
      .style('height', this.options.height);

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

    const gradient = interpolateHsl(
      color(this.options.startColor) as HSLColor,
      color(this.options.endColor) as HSLColor,
    );

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
        ).toString(),
      )
      .style('mix-blend-mode', 'multiply');

    link
      .append('path')
      .attr('d', (d) => d.layout.path)
      .attr('stroke-width', (d) => Math.max(1, d.layout.width));

    link
      .append('title')
      .text((d) => `${d.source.label} → ${d.target.label}\n${d.flow}`);

    // Create nodes
    svg
      .append('g')
      .selectAll('rect')
      .data(graph.nodes)
      .join('rect')
      .attr('x', (d) => d.layout.x)
      .attr('y', (d) => d.layout.y)
      .attr('height', (d) => d.layout.height)
      .attr('width', (d) => d.layout.width)
      .attr('fill', (d) => gradient(d.id / graph.nodes.length));

    // Distribution handles
    const handleLayer = svg
      .append('g')
      .selectAll('rect')
      .data(
        graph.nodes.filter((node) => node.layout.distribution !== undefined),
      )
      .enter();
    // Left handle
    handleLayer
      .append('rect')
      .attr('x', (d) => {
        if (d.layout.distribution) {
          return d.layout.distribution[0].x;
        }
        return 0;
      })
      .attr('y', (d) => {
        if (d.layout.distribution) {
          return d.layout.distribution[0].y;
        }
        return 0;
      })
      .attr('height', (d) => d.layout.height)
      .attr('width', () => this.options.distHandleWidth)
      .attr('fill', (d) => gradient(d.id / graph.nodes.length));
    // Right handle
    handleLayer
      .append('rect')
      .attr('x', (d) => {
        if (d.layout.distribution) {
          return d.layout.distribution[1].x;
        }
        return 0;
      })
      .attr('y', (d) => {
        if (d.layout.distribution) {
          return d.layout.distribution[1].y;
        }
        return 0;
      })
      .attr('height', (d) => d.layout.height)
      .attr('width', () => this.options.distHandleWidth)
      .attr('fill', (d) => gradient(d.id / graph.nodes.length));
    // Center line
    handleLayer
      .append('rect')
      .attr('x', (d) => {
        if (d.layout.distribution) {
          return d.layout.distribution[0].x;
        }
        return 0;
      })
      .attr('y', (d) => {
        if (d.layout.distribution) {
          return d.layout.y + d.layout.height / 2;
        }
        return 0;
      })
      .attr('height', () => this.options.distHandleWidth)
      .attr('width', (d) => {
        if (d.layout.distribution) {
          return d.layout.distribution[1].x - d.layout.distribution[0].x;
        }
        return 0;
      })
      .attr('fill', (d) => gradient(d.id / graph.nodes.length));

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

  /**
   * Scales the given time value to the range specified in options.
   *
   * @param time - The original x coordinate.
   * @returns - The scaled x coordinate.
   */
  private getTimeX(time: number): number {
    return (
      (this.range[1] - this.range[0]) *
        (time / (this.timeline.maxTime - this.timeline.minTime)) +
      this.range[0]
    );
  }
}
