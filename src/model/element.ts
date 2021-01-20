export enum ElementType {
    POINT = "PKT",
    LINE = "LIN",
    CIRCLE = "CIR",
    ARC = "ARC",
    CONSTRUCTION_LINE = "CLIN",
    CONSTRUCTION_CIRCLE = "CCIR",
    CHAMFER = "CHA",
    ROUNDING = "FIL",
    ARROW = "LED",
    QUAD = "QUAD",
    TEXT = "TXT",
}

export enum ElementColor {
    UNDEFINED = -1,
    BLACK = 0,
    WHITE = 1,
    RED = 2,
    YELLOW = 3,
    GREEN = 4,
    CYAN = 5,
    BLUE = 6,
    MAGENTA = 7,
    HIGHLIGHT_1 = 8,
    HIGHLIGHT_2 = 9,
    LIGHT_GREY = 10,
}

export enum ElementStroke {
    SOLID = 0,
    DASH = 1,
    DOT = 2,
    DASH_DOT = 3,
    DASH_DOT_DOT = 4,
    LONG_DASH = 5,
    CENTER_DASH = 6,
    CENTER_DASH_DASH = 7,
    SOLID_THICK = 8,
}

export interface Element {
    type: ElementType;
    color: ElementColor;
    stroke: ElementStroke;
    attributes?: number[];
}