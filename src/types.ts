import type TimelineLink from './TimelineLink';
import type TimelineNode from './TimelineNode';

export interface TimelineGraph {
  links: TimelineLink[];
  nodes: TimelineNode[];
}

export interface CircularPathData {
  arcRadius: number;
  leftFullExtent: number;
  leftInnerExtent: number;
  leftLargeArcRadius: number;
  leftNodeBuffer: number;
  leftSmallArcRadius: number;
  rightFullExtent: number;
  rightInnerExtent: number;
  rightLargeArcRadius: number;
  rightNodeBuffer: number;
  rightSmallArcRadius: number;
  sourceWidth: number;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  verticalBuffer: number;
  verticalFullExtent: number;
  verticalLeftInnerExtent: number;
  verticalRightInnerExtent: number;
}
