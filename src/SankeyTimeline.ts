import findCircuits from 'elementary-circuits-directed-graph';
import { bezierBezierIntersectionFast, evalDeCasteljau } from 'flo-bezier3';
import TimelineLink from './TimelineLink';
import TimelineNode from './TimelineNode';
import { TimelineGraph } from './types';

/**
 * Create and render a Sankey diagram along a timeline.
 */
export default class SankeyTimeline {
  private keyTimes: number[] = [];

  private links: Record<number, TimelineLink> = {};

  private nextLinkId = 0;

  private nextNodeId = 0;

  private nodes: Record<number, TimelineNode> = {};

  public range: [number, number] = [0, 0];

  private topLinkCount = 0;

  /**
   * Adds a key time.
   *
   * @param time - The key time to add.
   */
  private addKeyTime(time: number) {
    if (this.keyTimes.indexOf(time) < 0) {
      this.keyTimes.push(time);
      this.keyTimes.sort((a, b) => a - b);
    }
  }

  /**
   * Adds a link between two nodes.
   *
   * @param source - The source node.
   * @param target - The target node.
   * @param flow - The link flow amount.
   * @returns The created link.
   */
  public addLink(
    source: TimelineNode,
    target: TimelineNode,
    flow: number,
  ): TimelineLink {
    const link = new TimelineLink(this, this.nextLinkId, source, target, flow);
    source.addOutgoingLink(link);
    target.addIncomingLink(link);
    this.links[this.nextLinkId] = link;
    link.isCircular = this.isCircular(link);
    this.nextLinkId += 1;
    return link;
  }

  /**
   * Adds a node to the timeline.
   *
   * @param label - The label for the node.
   * @param startTime - The node start time.
   * @param endTime - The node end time.
   * @returns The created node.
   */
  public addNode(
    label: string,
    startTime: number,
    endTime: number,
  ): TimelineNode {
    const node = new TimelineNode(
      this,
      this.nextNodeId,
      label,
      startTime,
      endTime,
    );
    this.nodes[this.nextNodeId] = node;
    this.addKeyTime(startTime);
    this.addKeyTime(endTime);
    node.row = this.getRow(node);
    this.nextNodeId += 1;
    return node;
  }

  /**
   * Shift graph items around to minimize overlaps.
   */
  public adjust(): void {
    Object.values(this.nodes).forEach((node) => {
      let maxY = 0;
      this.findLinkOverlaps(node).intersections.forEach((overlaps) => {
        overlaps.forEach((curve) => {
          curve
            .map((p) => p.map((q) => Number(q.toPrecision(2))))
            .forEach((point) => {
              if (point[1] > maxY && point[1] < node.y + node.height / 2) {
                maxY = point[1];
              }
            });
        });
      });
      this.nodes[node.id].netAdjustment.y += maxY;
    });
  }

  /**
   * A dynamically constructed adjacency list of the links in the graph.
   *
   * @returns The adjacency list.
   */
  private get circuits(): number[][] {
    const adjList: number[][] = [];
    Object.values(this.links).forEach((link) => {
      const source = link.source.id;
      const target = link.target.id;
      if (!adjList[source]) {
        adjList[source] = [];
      }
      if (!adjList[target]) {
        adjList[target] = [];
      }
      if (adjList[source].indexOf(target) < 0) {
        adjList[source].push(target);
      }
    });
    return findCircuits(adjList);
  }

  /**
   * Clears adjustments made by adjust().
   */
  public clearAdjustments(): void {
    Object.values(this.nodes).forEach((node) => {
      this.nodes[node.id].netAdjustment.y = 0;
    });
  }

  /**
   * Finds links overlapping with the given node.
   *
   * @param target - The node to find overlaps for.
   * @returns The overlapping links.
   */
  public findLinkOverlaps(target: TimelineNode): {
    intersections: number[][][][];
    links: TimelineLink[];
  } {
    const linkOverlaps: number[] = [];
    const intersections: number[][][][] = [];
    Object.values(this.links).forEach((link) => {
      target.boundingBezierCurves.forEach((curve) => {
        const i = bezierBezierIntersectionFast(curve, link.curve);
        if (i.length > 0 && linkOverlaps.indexOf(link.id) < 0) {
          linkOverlaps.push(link.id);
          intersections.push(
            i.map((j) => j.map((k) => evalDeCasteljau(curve, k))),
          );
        }
      });
    });
    return {
      intersections,
      links: linkOverlaps.map((id) => this.links[id]),
    };
  }

  /**
   * Finds nodes overlapping with the given node.
   *
   * @param target - The node to find overlaps for.
   * @returns Overlapping nodes, if any.
   */
  public findOverlaps(target: TimelineNode): TimelineNode[] {
    const overlaps: TimelineNode[] = [];
    Object.values(this.nodes).forEach((node) => {
      if (target.id !== node.id) {
        if (
          (target.x1 >= node.x && target.x <= node.x) ||
          (node.x1 >= target.x && node.x <= target.x)
        ) {
          overlaps.push(node);
        }
      }
    });
    return overlaps;
  }

  /**
   * Gets the d3 graph.
   *
   * @returns The d3 graph object.
   */
  public getGraph(): TimelineGraph {
    return {
      links: Object.values(this.links),
      nodes: Object.values(this.nodes),
    };
  }

  /**
   * Finds the row for a node.
   *
   * @param node - The node to find the row for.
   * @returns The node's row.
   */
  private getRow(node: TimelineNode) {
    const overlapRows = this.findOverlaps(node).map((o) => o.row);
    let minEmptyRow = 0;
    while (overlapRows.indexOf(minEmptyRow) >= 0) {
      minEmptyRow += 1;
    }
    return minEmptyRow;
  }

  /**
   * Determines if a link is the final link in a circuit.
   *
   * @param link - The link to check.
   * @returns If the link is circular.
   */
  private isCircular(link: TimelineLink): boolean {
    let isCircular = link.target.id === link.source.id;
    this.circuits.forEach((circuit) => {
      const lastLink = circuit.slice(-2);
      if (lastLink[0] === link.source.id && lastLink[1] === link.target.id) {
        isCircular = true;
      }
    });
    return isCircular;
  }

  /**
   * Maximum link flow in the graph.
   *
   * @returns The largest flow value in the graph.
   */
  public get maxFlow(): number {
    let maxFlow = 0;
    Object.values(this.links).forEach((link) => {
      if (link.flow > maxFlow) {
        maxFlow = link.flow;
      }
    });
    return maxFlow;
  }

  /**
   * The maximum time in the graph.
   *
   * @returns The maximum time in the graph.
   */
  public get maxTime(): number {
    if (this.keyTimes.length > 0) {
      return this.keyTimes[this.keyTimes.length - 1];
    }
    return 0;
  }

  /**
   * Gets the largest X value in the graph.
   *
   * @returns The largest X value in the graph.
   */
  public get maxX(): number {
    let maxX = 0;
    Object.values(this.nodes).forEach((node) => {
      if (node.x > maxX) {
        maxX = node.x;
      }
    });
    return maxX;
  }

  /**
   * Gets the largest Y value in the graph.
   *
   * @returns The largest Y value in the graph.
   */
  public get maxY(): number {
    let maxY = 0;
    Object.values(this.nodes).forEach((node) => {
      if (node.y > maxY) {
        maxY = node.y;
      }
    });
    return maxY;
  }

  /**
   * The minimum time in the graph.
   *
   * @returns The minimum time in the graph.
   */
  public get minTime(): number {
    if (this.keyTimes.length > 0) {
      return this.keyTimes[0];
    }
    return 0;
  }

  /**
   * Gets the smallest X value in the graph.
   *
   * @returns The smallest X value in the graph.
   */
  public get minX(): number {
    let minX = Infinity;
    Object.values(this.nodes).forEach((node) => {
      if (node.x < minX) {
        minX = node.x;
      }
    });
    return minX;
  }

  /**
   * Gets the smallest Y value in the graph.
   *
   * @returns The smallest Y value in the graph.
   */
  public get minY(): number {
    let minY = Infinity;
    Object.values(this.nodes).forEach((node) => {
      if (node.y < minY) {
        minY = node.y;
      }
    });
    return minY;
  }

  /**
   * Sets the graph's range dimensions.
   *
   * @param range - The range.
   */
  public setRange(range: [number, number]): void {
    this.range = range;
  }
}
