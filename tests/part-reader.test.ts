import { expect } from "chai";
import { Part } from "../src/model/part";
import { PartCopy } from "../src/model/part-copy";
import { Parser } from "../src/persistency/parser";
import { PartReader } from "../src/persistency/part-reader";

describe('test PartReader', () => {

    const SAMPLE_PART_TEXT = `MyName
MyInfo
RuleName
0.0 0.0 1.0
1.0 0.0 0.0 0.0
0.0 1.0 0.0 0.0
0.0 0.0 1.0 0.0
0.0 0.0 0.0 1.0
0.0 0.0 0.0
10.0 11.0 12.0
5.0 4.0 0.0
90.0
2
3
4
`;
    const SAMPLE_PART = {
        name: 'MyName',
        info: 'MyInfo',
        processingRule: 'RuleName',
        normDirection: { x: 0.0, y: 0.0, z: 1.0 },
        transformation: { values: [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0]] },
        min: { x: 0.0, y: 0.0, z: 0.0 },
        max: { x: 10.0, y: 11.0, z: 12.0 },
        centerOfGravity: { x: 5, y: 4, z: 0 },
        area: 90,
        contoursCount: 2,
        copiesCount: 3,
        subpartsCount: 4,
        isMirrored: 0,
        mirroringIndex: 0,
        points: {},
        elements: [],
        contours: [],
        copies: [],
        bendings: [],
        subparts: [],
        attributes: {},
        elementAttributes: {},
        bendingAttributes: {},

    } as Part;

    [
        {
            text: `${SAMPLE_PART_TEXT}##~~\n#~END\n...`,
            expect: SAMPLE_PART
        },
        {
            text: `${SAMPLE_PART_TEXT}1\n12\n##~~\n#~END\n...`,
            expect: { ...SAMPLE_PART, isMirrored: 1, mirroringIndex: 12 }
        },
        {
            text: `${SAMPLE_PART_TEXT}##~~\n#~31\nP\n1\n1.0 2.0 3.0\n|~\nP\n2\n2.0 3.0 4.0\n|~\nP\n3\n3.0 4.0 5.0\n|~\n##~~\n#~END\n...`,
            expect: { ...SAMPLE_PART, points: { 1: { x: 1, y: 2, z: 3 }, 2: { x: 2, y: 3, z: 4 }, 3: { x: 3, y: 4, z: 5 } } }
        },
        {
            text: `${SAMPLE_PART_TEXT}##~~\n#~33\n\n1 2 3\n0\n0.0 0.0 1.0\n0.0 0.0 0.0\n10.0 10.0 10.0\n5.0 5.0 0.0\n15.0\n-1\n##~~\n#~331\nLIN\n1 0\n13 14\n|~\n##~~\n#~KONT_END\n#~END\n...`,
            expect: { ...SAMPLE_PART, contours: [{}] }
        },
        {
            text: `${SAMPLE_PART_TEXT}##~~\n#~32\nLIN\n1 0\n13 14\n|~\n##~~\n#~END\n...`,
            expect: { ...SAMPLE_PART, elements: [{}] }
        },
        {
            text: `${SAMPLE_PART_TEXT}##~~\n#~34\nKopie\n1\n0.5 0.5 0.0 0.0\n0.5 0.5 0.0 0.0\n0.0 0.0 1.0 0.0\n10.0 20.0 0.0 1.0\n#~TEXTINFO\nNAME@VALUE\n###~TEXTINFO\n##~~\n#~END\n...`,
            expect: {
                ...SAMPLE_PART,
                copies: [{
                    info: 'Kopie',
                    number: 1,
                    transformation: { values: [[0.5, 0.5, 0.0, 0.0], [0.5, 0.5, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [10.0, 20.0, 0.0, 1.0]] },
                    attributes: { 'NAME': 'VALUE' },
                } as PartCopy]
            }
        },
        {
            text: `${SAMPLE_PART_TEXT}##~~\n#~37\n1 2 3\n35.0 30.0\n2.0 3.0\n1.6\n12\n13\n##~~\n#~371\nLIN\n1 0\n13 14\n|~\n##~~\n#~BIEG_END\n#~END\n...`,
            expect: { ...SAMPLE_PART, bendings: [{}] }
        },
        {
            text: `${SAMPLE_PART_TEXT}##~~\n#~35\nMyName\nMyInfo\nMyNumber\n0.0 0.0 0.0\n10.0 11.0 12.0\n5.0 4.0 0.0\n90.0\n3\n##~~\n#~SUB_END\n#~END\n...`,
            expect: { ...SAMPLE_PART, subparts: [{}] }
        },
        {
            text: `${SAMPLE_PART_TEXT}##~~\n#~30\n#~TTINFO_END\n#~END\n...`,
            expect: { ...SAMPLE_PART, attributes: {} }
        },
        {
            text: `${SAMPLE_PART_TEXT}##~~\n#~30\nTKUND@Herr Meyer\nBEARB@Ich\n#~TTINFO_END\n#~END\n...`,
            expect: { ...SAMPLE_PART, attributes: { 'TKUND': 'Herr Meyer', 'BEARB': 'Ich' } }
        },
        {
            text: `${SAMPLE_PART_TEXT}##~~\n#~36\nATT\n1\n2\nDATA1\nDATA2\n|~\nATT\n2\n3\n|~\n#~ATTRIBUTE_END\n#~END\n...`,
            expect: { ...SAMPLE_PART, elementAttributes: { 1: { number: 1, type: 2, data: ['DATA1', 'DATA2'] }, 2: { number: 2, type: 3, data: [] } } }
        },
        {
            text: `${SAMPLE_PART_TEXT}##~~\n#~38\nBATT\n1\n2\nDATA1\nDATA2\n|~\nBATT\n2\n3\n|~\n#~BEND_ATTRIBUTE_END\n#~END\n...`,
            expect: { ...SAMPLE_PART, bendingAttributes: { 1: { number: 1, type: 2, data: ['DATA1', 'DATA2'] }, 2: { number: 2, type: 3, data: [] } } }
        },
    ].forEach(test => {
        it(`should read expected for ${JSON.stringify(test.text)}`, () => {
            const reader = new PartReader(new Parser(test.text));
            const actual = reader.read();
            actual.contours = actual.contours.map(_ => ({} as any));
            actual.elements = actual.elements.map(_ => ({} as any));
            actual.bendings = actual.bendings.map(_ => ({} as any));
            actual.subparts = actual.subparts.map(_ => ({} as any));
            expect(test.expect).to.eql(actual);
        })
    });

});