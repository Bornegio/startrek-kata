const mathSupport = require("../src/utils/mathSupport");
const Point = require("../src/utils/point");

describe("Test cityBlockDistance", () => {
    test.each([[0, 0, 1, 1, 2], [0, 0, -1, -1, 2], [0, 0, 0, 0, 0]])(
        "calculates distance between different points in a space",
        (x1, y1, x2, y2, expected) => {
            expect(mathSupport.cityBlockDistance(x1, y1, x2, y2)).toBe(expected);
        }
    );
});

describe("Test randomUniques", () => {
    it("Should return an array of integers", () => {
        const result = mathSupport.randomUniques(0, 10, 5);
        expect(result).toBeInstanceOf(Array);
        expect(result).toHaveLength(5);
        result.forEach(el => expect(typeof el).toBe("number"));
    });
    it("Should have no repeating numbers", () => {
        const min = 1;
        const max = 100;
        const result = mathSupport.randomUniques(min, max, max - min);
        for (let i = min; i < max - min; i++) {
            expect(result.lastIndexOf(result[i])).toBe(i);
        }
    });
    it("Should return every number if range is equals to length", () => {
        const min = 1;
        const max = 100;
        const result = mathSupport.randomUniques(min, max, max - min);
        for (let i = min; i < max; i++) {
            expect(result).toContain(i);
        }
    });
    it("Should throw an error if given length is bigger than range", () => {
        expect(() => mathSupport.randomUniques(0, 10, 11)).toThrow(RangeError);
    });
});

describe("Test hasSamePos", () => {
    it("Should return true if positions are equals", () =>
        expect(mathSupport.hasSamePos(new Point(3, 3), new Point(3, 3))).toBe(true));
    it("Should return true if positions are different", () =>
        expect(mathSupport.hasSamePos(new Point(3, 3), new Point(3, 1))).toBe(false));
});

describe('Test inRange', () => {
    it('Should return true if given value is in range', () => {
        expect(mathSupport.inRange(0, 0, 100)).toBe(true);
        expect(mathSupport.inRange(50, 0, 100)).toBe(true);
        expect(mathSupport.inRange(100, 0, 100)).toBe(true);
    });
    it('Should return false if given value is not in range', () => {
        expect(mathSupport.inRange(-1, 0, 100)).toBe(false);
        expect(mathSupport.inRange(101, 0, 100)).toBe(false);
    })
    it('Should throw a RangeError if min value is bigger than max', () => {
        expect(() => mathSupport.inRange(0, 100, 0)).toThrow(RangeError);
    })
});
