/* eslint-disable @typescript-eslint/no-explicit-any */
/* ──────────────────────────────────────────────
   Repeat rules for header / footer rendering
   ────────────────────────────────────────────── */
export type RepeatRule =
  | "all" // every page            (default)
  | "first" // only page 1
  | "last" // only final page
  | number[] // explicit page numbers
  | { except: number[] }; // every page EXCEPT…

/* ──────────────────────────────────────────────
   Common coordinate props shared by all widgets
   ────────────────────────────────────────────── */
interface Position {
  /** Distance from left edge (PDF points) */
  x: number;
  /** Distance from bottom edge (PDF points) */
  y: number;
}

/* ──────────────────────────────────────────────
   Widget definitions
   (add new ones as your engine grows)
   ────────────────────────────────────────────── */

export interface TextElement extends Position {
  type: "text";
  /** Static string OR runtime data lookup */
  value: "static" | "data";
  /** Shown when value === "static" */
  text?: string;
  /** Dot-path when value === "data"  (e.g. "customer.name") */
  key?: string;
  align?: "left" | "right";
  style?: {
    font?: "Poppins-Regular" | "Poppins-SemiBold" | "Poppins-Bold" | string;
    size?: number;
    color?: `#${string}`;
  };
}

export interface ImageElement extends Position {
  type: "image";
  /** Path in payload that points to a data-URL, Buffer or URL */
  key: string;
  w?: number;
  h?: number;
}

export interface RectElement extends Position {
  type: "rect";
  w: number;
  h: number;
  fill?: `#${string}`;
  border?: { width: number; color: `#${string}` };
}

export interface MetaRowElement extends Position {
  type: "metaRow";
  /** Array of `[label, payloadKey]` */
  cols: [label: string, key: string][];
}

export interface TableHeaderElement extends Position {
  type: "tableHeader";
  h: number;
  fill?: `#${string}`;
  columns: {
    text: string;
    width: number;
    align?: "left" | "right";
  }[];
}

export interface TableRowsElement extends Position {
  type: "tableRows";
  /** Starting Y for first row */
  startY: number;
  rowHeight: number;
  /** Path to array in payload, e.g. "items" */
  key: string;
  columns: {
    /** Dot-path inside each row object */
    key: string;
    width?: number;
    align?: "left" | "right";
  }[];
}

export interface ChartElement extends Position {
  type: "chart";
  w: number;
  h: number;
  engine?: "quickchart" | "chartjs"; // default: quickchart
  /** Standard Chart.js config object */
  config: any;
}

export interface PageBreakElement {
  type: "pageBreak";
}

/* ---------- Union of all widgets ---------- */
export type TemplateElement =
  | TextElement
  | ImageElement
  | RectElement
  | MetaRowElement
  | TableHeaderElement
  | TableRowsElement
  | ChartElement
  | PageBreakElement;

/* ──────────────────────────────────────────────
   Header / footer block
   ────────────────────────────────────────────── */
export interface Section {
  repeat?: RepeatRule; // default = "all"
  elements: TemplateElement[];
}

/* ──────────────────────────────────────────────
   Top-level PDF template
   ────────────────────────────────────────────── */
export interface PdfTemplateInput {
  /** ISO size keyword ("A4", "LETTER") OR [w, h] in points */
  pageSize: string | [number, number];
  orientation: "portrait" | "landscape";

  /** Optional header & footer */
  header?: Section;
  footer?: Section;

  /** Main body widgets */
  body: TemplateElement[];

  code: string;
}
