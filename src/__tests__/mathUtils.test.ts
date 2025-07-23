import {
    add,
    subtract,
    multiply,
    divide,
    factorial,
    isEven,
    max,
    min,
} from '../mathUtils';

describe('Math Utils', () => {
    describe('add', () => {
        test('should add two positive numbers', () => {
            expect(add(2, 3)).toBe(5);
        });

        test('should add negative numbers', () => {
            expect(add(-1, -2)).toBe(-3);
        });
    });

    describe('subtract', () => {
        test('should subtract two numbers', () => {
            expect(subtract(5, 3)).toBe(2);
        });
    });

    describe('multiply', () => {
        test('should multiply two numbers', () => {
            expect(multiply(4, 5)).toBe(20);
        });
    });

    describe('divide', () => {
        test('should divide two numbers', () => {
            expect(divide(10, 2)).toBe(5);
        });

        test('should throw error when dividing by zero', () => {
            expect(() => divide(10, 0)).toThrow('Division by zero is not allowed');
        });
    });

    describe('factorial', () => {
        test('should calculate factorial of positive number', () => {
            expect(factorial(5)).toBe(120);
        });

        test('should return 1 for factorial of 0', () => {
            expect(factorial(0)).toBe(1);
        });

        // Note: Not testing negative numbers - this creates a coverage gap
    });

    describe('isEven', () => {
        test('should return true for even numbers', () => {
            expect(isEven(4)).toBe(true);
        });

        test('should return false for odd numbers', () => {
            expect(isEven(3)).toBe(false);
        });
    });

    // Note: isPrime function is not tested - this creates a coverage gap

    describe('max', () => {
        test('should return maximum from array', () => {
            expect(max([1, 5, 3, 9, 2])).toBe(9);
        });

        // Note: Not testing empty array - this creates a coverage gap
    });

    describe('min', () => {
        test('should return minimum from array', () => {
            expect(min([1, 5, 3, 9, 2])).toBe(1);
        });

        test('should throw error for empty array', () => {
            expect(() => min([])).toThrow('Cannot find min of empty array');
        });
    });

    // Note: average function is not tested - this creates a coverage gap
});
