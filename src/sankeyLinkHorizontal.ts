import { DefaultLinkObject, Link, linkHorizontal } from 'd3';
import TimelineLink from './TimelineLink';

/**
 * Creates a horizontal D3 link using d3-sankey-timeline's custom properties.
 *
 * @returns The horizontal link.
 */
export default function sankeyLinkHorizontal(): Link<
never,
DefaultLinkObject,
[number, number]
> {
  return linkHorizontal()
    .source((d0) => {
      const d = d0 as unknown as TimelineLink;
      return [d.source.x1, d.y];
    })
    .target((d0) => {
      const d = d0 as unknown as TimelineLink;
      return [d.target.x, d.y1];
    });
}
