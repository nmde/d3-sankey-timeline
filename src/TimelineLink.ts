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
    const normalPath = linkHorizontal()
      .source((d0) => {
        const d = d0 as unknown as TimelineLink;
        return [d.source.x1, d.y];
      })
      .target((d0) => {
        const d = d0 as unknown as TimelineLink;
        return [d.target.x, d.y1];
      })(this as unknown as DefaultLinkObject);
    return normalPath;
  }

  /**
   * Gets the path string for the link.
   *
   * @returns The path string.
   */
  public get path(): string {
    if (this.isCircular) {
      let pathString = '';
      if (this.circularLinkType === 'top') {
        pathString =
          // start at the right of the source node
          `M${this.circularPathData.sourceX} ${this.circularPathData.sourceY} ` +
          // line right to buffer point
          `L${this.circularPathData.leftInnerExtent} ${this.circularPathData.sourceY} ` +
          // Arc around: Centre of arc X and  //Centre of arc Y
          `A${this.circularPathData.leftLargeArcRadius} ${
            this.circularPathData.leftSmallArcRadius
          } 0 0 0 ${
            // End of arc X //End of arc Y
            this.circularPathData.leftFullExtent
          } ${
            this.circularPathData.sourceY -
            this.circularPathData.leftSmallArcRadius
          } ` + // End of arc X
          // line up to buffer point
          `L${this.circularPathData.leftFullExtent} ${this.circularPathData.verticalLeftInnerExtent} ` +
          // Arc around: Centre of arc X and  //Centre of arc Y
          `A${this.circularPathData.leftLargeArcRadius} ${
            this.circularPathData.leftLargeArcRadius
          } 0 0 0 ${
            // End of arc X //End of arc Y
            this.circularPathData.leftInnerExtent
          } ${this.circularPathData.verticalFullExtent} ` + // End of arc X
          // line left to buffer point
          `L${this.circularPathData.rightInnerExtent} ${this.circularPathData.verticalFullExtent} ` +
          // Arc around: Centre of arc X and  //Centre of arc Y
          `A${this.circularPathData.rightLargeArcRadius} ${
            this.circularPathData.rightLargeArcRadius
          } 0 0 0 ${
            // End of arc X //End of arc Y
            this.circularPathData.rightFullExtent
          } ${this.circularPathData.verticalRightInnerExtent} ` + // End of arc X
          // line down
          `L${this.circularPathData.rightFullExtent} ${
            this.circularPathData.targetY -
            this.circularPathData.rightSmallArcRadius
          } ` +
          // Arc around: Centre of arc X and  //Centre of arc Y
          `A${this.circularPathData.rightLargeArcRadius} ${
            this.circularPathData.rightSmallArcRadius
          } 0 0 0 ${
            // End of arc X //End of arc Y
            this.circularPathData.rightInnerExtent
          } ${this.circularPathData.targetY} ` + // End of arc X
          // line to end
          `L${this.circularPathData.targetX} ${this.circularPathData.targetY}`;
      } else {
        // bottom path
        pathString =
          // start at the right of the source node
          `M${this.circularPathData.sourceX} ${this.circularPathData.sourceY} ` +
          // line right to buffer point
          `L${this.circularPathData.leftInnerExtent} ${this.circularPathData.sourceY} ` +
          // Arc around: Centre of arc X and  //Centre of arc Y
          `A${this.circularPathData.leftLargeArcRadius} ${
            this.circularPathData.leftSmallArcRadius
          } 0 0 1 ${
            // End of arc X //End of arc Y
            this.circularPathData.leftFullExtent
          } ${
            this.circularPathData.sourceY +
            this.circularPathData.leftSmallArcRadius
          } ` + // End of arc X
          // line down to buffer point
          `L${this.circularPathData.leftFullExtent} ${this.circularPathData.verticalLeftInnerExtent} ` +
          // Arc around: Centre of arc X and  //Centre of arc Y
          `A${this.circularPathData.leftLargeArcRadius} ${
            this.circularPathData.leftLargeArcRadius
          } 0 0 1 ${
            // End of arc X //End of arc Y
            this.circularPathData.leftInnerExtent
          } ${this.circularPathData.verticalFullExtent} ` + // End of arc X
          // line left to buffer point
          `L${this.circularPathData.rightInnerExtent} ${this.circularPathData.verticalFullExtent} ` +
          // Arc around: Centre of arc X and  //Centre of arc Y
          `A${this.circularPathData.rightLargeArcRadius} ${
            this.circularPathData.rightLargeArcRadius
          } 0 0 1 ${
            // End of arc X //End of arc Y
            this.circularPathData.rightFullExtent
          } ${this.circularPathData.verticalRightInnerExtent} ` + // End of arc X
          // line up
          `L${this.circularPathData.rightFullExtent} ${
            this.circularPathData.targetY +
            this.circularPathData.rightSmallArcRadius
          } ` +
          // Arc around: Centre of arc X and  //Centre of arc Y
          `A${this.circularPathData.rightLargeArcRadius} ${
            this.circularPathData.rightSmallArcRadius
          } 0 0 1 ${
            // End of arc X //End of arc Y
            this.circularPathData.rightInnerExtent
          } ${this.circularPathData.targetY} ` + // End of arc X
          // line to end
          `L${this.circularPathData.targetX} ${this.circularPathData.targetY}`;
      }
      return pathString;
    }
    return this.normalPathData as string;
  }

  /**
   * Gets the link's width.
   *
   * @returns The link's width.
   */
  public get width(): number {
    return 100;
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
