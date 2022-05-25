import type TimelineLink from './TimelineLink';

/**
 * A node in the timeline.
 */
export default class TimelineNode {
  public endTime: string;

  public id: number;

  public incomingLinks: TimelineLink[] = [];

  public label: string;

  public outgoingLinks: TimelineLink[] = [];

  public startTime: string;

  /**
   * Constructs TimelineNode.
   *
   * @param id - The node's id.
   * @param label - The node's label.
   * @param startTime - The node's starting time.
   * @param endTime - The node's ending time.
   */
  public constructor(
    id: number,
    label: string,
    startTime: string,
    endTime: string,
  ) {
    this.id = id;
    this.label = label;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  /**
   * Adds an incoming link.
   *
   * @param link - The incoming link.
   * @returns This.
   */
  public addIncomingLink(link: TimelineLink): TimelineNode {
    this.incomingLinks.push(link);
    return this;
  }

  /**
   * Adds a link leaving this node.
   *
   * @param link - The outgoing link.
   * @returns This.
   */
  public addOutgoingLink(link: TimelineLink): TimelineNode {
    this.outgoingLinks.push(link);
    return this;
  }
}
