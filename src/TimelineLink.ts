import type SankeyTimeline from './SankeyTimeline';
import TimelineNode from './TimelineNode';

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

  /**
   * If the link is the only circular link of its nodes.
   *
   * @returns If the link is the only circular link.
   */
  public get isOnlyCircularLink(): boolean {
    let onlyCircularLink = this.isCircular;
    this.source.links.forEach((link) => {
      if (link.id !== this.id && link.isCircular) {
        onlyCircularLink = false;
      }
    });
    return onlyCircularLink;
  }

  /**
   * If the link is self-linking.
   *
   * @returns If the link is self-linking.
   */
  public get isSelfLinking(): boolean {
    return this.source.id === this.target.id;
  }

  /**
   * Gets the path string for the link.
   *
   * @returns The path string.
   */
  public get path(): string {
    if (this.isCircular) {
      const y = this.source.y + this.source.height / 2;
      const y1 = this.target.y + this.target.height / 2;
      const curveHeight = 50;
      const curveModifier = 200;
      return `M${this.source.x1 - 5},${y}C${this.source.x1 + curveModifier},${
        y - curveHeight
      },${this.target.x - curveModifier},${y1 - curveHeight},${
        this.target.x + 5
      },${y1}`;
    }
    const curveModifier = 200;
    const y = this.source.y + this.source.height / 2;
    const y1 = this.target.y + this.target.height / 2;
    return `M${this.source.x1},${y}C${this.source.x1 + curveModifier},${y},${
      this.target.x - curveModifier
    },${y1},${this.target.x},${y1}`;
  }

  /**
   * Gets the link's width.
   *
   * @returns The link's width.
   */
  public get width(): number {
    return 100 * (this.flow / this.graph.maxFlow);
  }

  /**
   * Gets the link's start Y coordinate.
   *
   * @returns The link's start Y coordinate.
   */
  public get y(): number {
    return this.source.getY(this);
  }

  /**
   * Gets the link's end Y coordinate.
   *
   * @returns The link's end Y coordinate.
   */
  public get y1(): number {
    return this.target.getY1(this);
  }
}
