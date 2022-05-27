import { DefaultLinkObject, linkHorizontal } from 'd3';
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

  /**
   * Computes the circular path data.
   *
   * @returns The circular path data.
   */
  public get circularPathData(): CircularPathData {
    const baseRadius = 10;
    const buffer = 5;
    const verticalMargin = 25;
    const radiusOffset = 0;
    const circularLinkGap = 2;
    const circularPathData: CircularPathData = {
      arcRadius: this.width + baseRadius,
      leftFullExtent: 0,
      leftInnerExtent: 0,
      leftLargeArcRadius: 0,
      leftNodeBuffer: buffer,
      leftSmallArcRadius: 0,
      rightFullExtent: 0,
      rightInnerExtent: 0,
      rightLargeArcRadius: 0,
      rightNodeBuffer: buffer,
      rightSmallArcRadius: 0,
      sourceWidth: this.source.width,
      sourceX: this.source.x1,
      sourceY: this.y,
      targetX: this.target.x,
      targetY: this.y1,
      verticalBuffer: 0,
      verticalFullExtent: 0,
      verticalLeftInnerExtent: 0,
      verticalRightInnerExtent: 0,
    };
    if (this.isCircular) {
      if (this.isSelfLinking && this.isOnlyCircularLink) {
        circularPathData.leftSmallArcRadius = baseRadius + this.width / 2;
        circularPathData.leftLargeArcRadius = baseRadius + this.width / 2;
        circularPathData.rightSmallArcRadius = baseRadius + this.width / 2;
        circularPathData.rightLargeArcRadius = baseRadius + this.width / 2;
        if (this.circularLinkType === 'bottom') {
          circularPathData.verticalFullExtent =
            this.source.y1 + verticalMargin + circularPathData.verticalBuffer;
          circularPathData.verticalLeftInnerExtent =
            circularPathData.verticalFullExtent -
            circularPathData.leftLargeArcRadius;
          circularPathData.verticalRightInnerExtent =
            circularPathData.verticalFullExtent -
            circularPathData.rightLargeArcRadius;
        } else {
          circularPathData.verticalFullExtent =
            this.source.y - verticalMargin - circularPathData.verticalBuffer;
          circularPathData.verticalLeftInnerExtent =
            circularPathData.verticalFullExtent +
            circularPathData.leftLargeArcRadius;
          circularPathData.verticalRightInnerExtent =
            circularPathData.verticalFullExtent +
            circularPathData.rightLargeArcRadius;
        }
      } else {
        circularPathData.leftSmallArcRadius =
          baseRadius + this.width / 2 + radiusOffset;
        circularPathData.leftLargeArcRadius =
          baseRadius +
          this.width / 2 +
          this.id * circularLinkGap +
          radiusOffset;
        circularPathData.rightSmallArcRadius =
          baseRadius + this.width / 2 + radiusOffset;
        circularPathData.rightLargeArcRadius =
          baseRadius +
          this.width / 2 +
          this.id * circularLinkGap +
          radiusOffset;
        if (this.circularLinkType === 'bottom') {
          circularPathData.verticalFullExtent =
            Math.max(this.source.y1, this.target.y1) +
            verticalMargin +
            circularPathData.verticalBuffer;
          circularPathData.verticalLeftInnerExtent =
            circularPathData.verticalFullExtent -
            circularPathData.leftLargeArcRadius;
          circularPathData.verticalRightInnerExtent =
            circularPathData.verticalFullExtent -
            circularPathData.rightLargeArcRadius;
        } else {
          circularPathData.verticalFullExtent =
            this.graph.minY - verticalMargin - circularPathData.verticalBuffer;
          circularPathData.verticalLeftInnerExtent =
            circularPathData.verticalFullExtent +
            circularPathData.leftLargeArcRadius;
          circularPathData.verticalRightInnerExtent =
            circularPathData.verticalFullExtent +
            circularPathData.rightLargeArcRadius;
        }
      }
    }
    return circularPathData;
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
   * Normal path data (non-circular links).
   *
   * @returns The normal path data.
   */
  public get normalPathData(): string | null {
    if (this.isCircular) {
      return null;
    }
    const curveModifier = 200;
    const y = this.source.y + this.source.height / 2;
    const y1 = this.target.y + this.target.height / 2;
    return `M${this.source.x1},${y}C${this.source.x1 + curveModifier},${y},${
      this.target.x - curveModifier
    },${y1},${this.target.x},${y1}`;
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
    return this.normalPathData as string;
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
