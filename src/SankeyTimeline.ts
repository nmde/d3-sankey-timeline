import findCircuits from 'elementary-circuits-directed-graph';
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
    const link = new TimelineLink(this.nextLinkId, source, target, flow);
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
    const node = new TimelineNode(this.nextNodeId, label, startTime, endTime);
    this.nodes[this.nextNodeId] = node;
    this.addKeyTime(startTime);
    this.addKeyTime(endTime);
    this.nextNodeId += 1;
    return node;
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
   * Creates the d3 graph.
   *
   * @returns The d3 graph object.
   */
  public createGraph(): TimelineGraph {
    return {
      links: Object.values(this.links),
      nodes: Object.values(this.nodes),
    };
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
}
