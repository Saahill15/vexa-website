/*
 * Client proof shown on the home page. Add only real, approved quotes: when this list is empty
 * the testimonials section is not shown at all, so nothing is ever made up.
 */
export type Testimonial = {
  quote: string;
  name: string;
  role: string; // e.g. "Marketing Manager"
  org: string; // e.g. "Brand or team name"
};

export const TESTIMONIALS: Testimonial[] = [];
