import findCircuits from 'elementary-circuits-directed-graph';
import TimelineLink from './TimelineLink';
import TimelineNode from './TimelineNode';

/**
 * Create and render a Sankey diagram along a timeline.
 */
export default class SankeyTimeline {
  private links: Record<number, TimelineLink> = {};

  private nextLinkId = 0;

  private nextNodeId = 0;

  private nodes: Record<number, TimelineNode> = {};

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
    startTime: string,
    endTime: string,
  ): TimelineNode {
    const node = new TimelineNode(this.nextNodeId, label, startTime, endTime);
    this.nodes[this.nextNodeId] = node;
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
}
