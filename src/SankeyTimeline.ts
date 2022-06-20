import findCircuits from 'elementary-circuits-directed-graph';
import TimelineLink from './TimelineLink';
import TimelineNode from './TimelineNode';
import {
  NodeTimes,
  TimelineGraph,
} from './types';
import { getKeyTimes } from './util';

/**
 * Creates a Sankey diagram along a timeline.
 */
export default class SankeyTimeline {
  private keyTimes: number[] = [];

  private links: Record<number, TimelineLink> = {};

  private nextLinkId = 0;

  private nextNodeId = 0;

  private nodes: Record<number, TimelineNode> = {};

  /**
   * Adds key times if they don't already exist.
   *
   * @param times - The times to add.
   */
  private addKeyTimes(...times: number[]) {
    times.forEach((time) => {
      if (this.keyTimes.indexOf(time) < 0) {
        this.keyTimes.push(time);
        this.keyTimes.sort((a, b) => a - b);
      }
    });
  }

  /**
   * Creates a link between two nodes.
   *
   * @param source - The source node.
   * @param target - The target node.
   * @param flow - The link flow amount.
   * @returns The created link.
   */
  public createLink(
    source: TimelineNode | number | string,
    target: TimelineNode | number | string,
    flow = 0,
  ): TimelineLink {
    let s: TimelineNode;
    if (typeof source === 'number') {
      s = this.nodes[source];
    } else if (typeof source === 'string') {
      [s] = this.getNodesByLabel(source);
    } else {
      s = source;
    }
    let t: TimelineNode;
    if (typeof target === 'number') {
      t = this.nodes[target];
    } else if (typeof target === 'string') {
      [t] = this.getNodesByLabel(target);
    } else {
      t = target;
    }
    const link = new TimelineLink(this, this.nextLinkId, s, t, flow);
    s.addOutgoingLink(link);
    t.addIncomingLink(link);
    this.links[this.nextLinkId] = link;
    this.nextLinkId += 1;
    return link;
  }

  /**
   * Creates a new node in the timeline.
   *
   * @param label - The label for the node.
   * @param times - Node timing data (either start + end time or median + std deviation).
   * @returns The created TimelineNode object.
   */
  public createNode(label: string, times: NodeTimes): TimelineNode {
    const node = new TimelineNode(this, this.nextNodeId, label, times);
    this.nodes[this.nextNodeId] = node;
    this.addKeyTimes(...getKeyTimes(times));
    this.nextNodeId += 1;
    return node;
  }

  /**
   * Gets a list of circuits (self-closing loops) in the graph.
   *
   * @returns The circuits in the graph.
   */
  public get circuits(): number[][] {
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
   * Returns all nodes with the given label.
   *
   * @param label - The label of nodes to find.
   * @returns The nodes with the given label, if any.
   */
  public getNodesByLabel(label: string): TimelineNode[] {
    return Object.values(this.nodes).filter((node) => node.label === label);
  }

  /**
   * Gets an object containing the nodes and links in the graph.
   *
   * @returns The graph object.
   */
  public get graph(): TimelineGraph {
    return {
      links: Object.values(this.links),
      nodes: Object.values(this.nodes),
    };
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
   * Maximum node size in the graph.
   *
   * @returns The maximum node size in the graph.
   */
  public get maxSize(): number {
    let maxSize = 0;
    Object.values(this.nodes).forEach((node) => {
      if (node.size > maxSize) {
        maxSize = node.size;
      }
    });
    return maxSize;
  }

  /**
   * Gets the maximum key time in the graph.
   *
   * @returns The maximum key time in the graph.
   */
  public get maxTime(): number {
    if (this.keyTimes.length > 0) {
      return this.keyTimes[this.keyTimes.length - 1];
    }
    return 0;
  }

  /**
   * Gets the smallest key time in the graph.
   *
   * @returns The smallest key time in the graph.
   */
  public get minTime(): number {
    if (this.keyTimes.length > 0) {
      return this.keyTimes[0];
    }
    return 0;
  }
}
