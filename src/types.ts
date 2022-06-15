import type TimelineLink from './TimelineLink';
import type TimelineNode from './TimelineNode';

export interface TimelineGraph {
  links: TimelineLink[];
  nodes: TimelineNode[];
}

export interface NodeLayout {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface LinkLayout {
  curve: number[][];
  path: string;
  width: number;
}
