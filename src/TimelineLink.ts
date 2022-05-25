import TimelineNode from './TimelineNode';

/**
 * A link between two nodes in the graph.
 */
export default class TimelineLink {
  public flow: number;

  public id: number;

  public isCircular = false;

  public source: TimelineNode;

  public target: TimelineNode;

  /**
   * Constructs TimelineLink.
   *
   * @param id - The link id.
   * @param source - The source node id.
   * @param target - The target node id.
   * @param flow - The link flow amount.
   */
  public constructor(
    id: number,
    source: TimelineNode,
    target: TimelineNode,
    flow: number,
  ) {
    this.id = id;
    this.source = source;
    this.target = target;
    this.flow = flow;
  }
}
