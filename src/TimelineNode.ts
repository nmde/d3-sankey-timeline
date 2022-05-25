import { sum } from 'd3';
import type SankeyTimeline from './SankeyTimeline';
import type TimelineLink from './TimelineLink';

/**
 * A node in the timeline.
 */
export default class TimelineNode {
  public endTime: number;

  public graph: SankeyTimeline;

  public id: number;

  public incomingLinks: TimelineLink[] = [];

  public label: string;

  public outgoingLinks: TimelineLink[] = [];

  public startTime: number;

  /**
   * Constructs TimelineNode.
   *
   * @param graph - The containing graph.
   * @param id - The node's id.
   * @param label - The node's label.
   * @param startTime - The node's starting time.
   * @param endTime - The node's ending time.
   */
  public constructor(
    graph: SankeyTimeline,
    id: number,
    label: string,
    startTime: number,
    endTime: number,
  ) {
    this.graph = graph;
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
   * Gets the height of the node.
   *
   * @returns The height of the node.
   */
  public get height(): number {
    return 100;
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

  /**
   * Gets the width of the node.
   *
   * @returns The width of the node.
   */
  public get width(): number {
    const width = (
      (this.graph.range[1] - this.graph.range[0]) *
        (this.endTime / (this.graph.maxTime - this.graph.minTime)) +
      this.graph.range[0] -
      this.x
    );
    if (width === 0) {
      return 1;
    }
    return width;
  }

  /**
   * The computed X coordinate for the node.
   *
   * @returns The X coordinate.
   */
  public get x(): number {
    return (
      (this.graph.range[1] - this.graph.range[0]) *
        (this.startTime / (this.graph.maxTime - this.graph.minTime)) +
      this.graph.range[0]
    );
  }

  /**
   * The computed Y coordinate for the node.
   *
   * @returns The Y coordinate.
   */
  public get y(): number {
    return this.id * this.height;
  }
}
