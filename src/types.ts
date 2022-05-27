import type TimelineLink from './TimelineLink';
import type TimelineNode from './TimelineNode';

export interface TimelineGraph {
  links: TimelineLink[];
  nodes: TimelineNode[];
}
