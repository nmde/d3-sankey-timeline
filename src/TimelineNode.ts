import { sum } from 'd3';
import type TimelineLink from './TimelineLink';

/**
 * A node in the timeline.
 */
export default class TimelineNode {
  public endTime: number;

  public id: number;

  public incomingLinks: TimelineLink[] = [];

  public label: string;

  public outgoingLinks: TimelineLink[] = [];

  public startTime: number;

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
    startTime: number,
    endTime: number,
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

  /**
   * Gets all links through the node.
   *
   * @returns All links through the node.
   */
  public get links(): TimelineLink[] {
    return this.incomingLinks.concat(this.outgoingLinks);
  }

  /**
   * If the node is part of a circuit.
   *
   * @returns If the node is part of a circuit.
   */
  public get partOfCircuit(): boolean {
    let partOfCircuit = false;
    this.links.forEach((link) => {
      if (link.isCircular) {
        partOfCircuit = true;
      }
    });
    return partOfCircuit;
  }

  /**
   * Gets the "size" of the node based on associated links.
   *
   * @returns The size of the node.
   */
  public get size(): number {
    return Math.max(
      sum(this.incomingLinks, (link) => link.flow),
      sum(this.outgoingLinks, (link) => link.flow),
    );
  }
}
