export enum AttributeType {
    Unknown = 0,
    Bogus = 1,
    Stroke = 2,
    Model = 3,
    HoleRow = 4,
    HoleCircle = 5,
    Notch = 6,
    Mark = 7,
    Bumping = 8,
    ProfileSide = 9,
    Text = 10,
    DimDiameter = 11,
    DimSize = 12,
    DimTwoPoints = 13,
    DimArcLength = 14,
    DimRadius = 15,
    DimAngle = 16,
    DimStaticArc = 17,
    Tag = 18,
    FileName = 19,
    ContourOffset = 20,
    DimOrdinate = 21, // Derivat von e_dbaseDimTwoPointsAttribute mit einen Punkt gesperrt
    TubeDirection = 22,
    Ellipse = 23,
    TubeSurface = 24,
    RefPos = 25, // Referenzpunkt eines Elements
    Form = 26, // Formattribut - fuer SpaceClaim Umformung
    FoilRemoval = 27, // Attribut fuer Folienabziehhilfe
}

export interface Attribute {
    number: number;
    type: AttributeType;
    data: string[];
}