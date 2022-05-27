import { link, linkHorizontal } from 'd3';
import type SankeyTimeline from './SankeyTimeline';
import TimelineNode from './TimelineNode';
import type { CircularPathData } from './types';

/**
 * A link between two nodes in the graph.
 */
export default class TimelineLink {
  public circularLinkType: string | null = null;

  public flow: number;

  public graph: SankeyTimeline;

  public id: number;

  public isCircular = false;

  public source: TimelineNode;

  public target: TimelineNode;

  /**
   * Constructs TimelineLink.
   *
   * @param graph - The graph that contains this link.
   * @param id - The link id.
   * @param source - The source node id.
   * @param target - The target node id.
   * @param flow - The link flow amount.
   */
  public constructor(
    graph: SankeyTimeline,
    id: number,
    source: TimelineNode,
    target: TimelineNode,
    flow: number,
  ) {
    this.graph = graph;
    this.id = id;
    this.source = source;
    this.target = target;
    this.flow = flow;
  }
}
