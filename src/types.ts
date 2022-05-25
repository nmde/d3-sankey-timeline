import TimelineLink from './TimelineLink';
import TimelineNode from './TimelineNode';

export interface TimelineGraph {
  links: TimelineLink[];
  nodes: TimelineNode[];
}
