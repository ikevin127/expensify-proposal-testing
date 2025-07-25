import {
    add,
    subtract,
    multiply,
    divide,
    factorial,
    isEven,
    isPrime,
    max,
    min,
    average,
    power,
    sqrt,
    gcd,
    lcm,
    fibonacci,
    isPerfectSquare,
    degreesToRadians,
    radiansToDegrees,
    circleArea,
    circleCircumference,
    randomInt,
    compoundInterest,
    distance,
    median,
    isLeapYear,
    percentageChange,
    isPalindrome,
    clamp,
    fibonacciNumber,
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

        test('should return 1 for factorial of 1', () => {
            expect(factorial(1)).toBe(1);
        });

        test('should throw error for negative numbers', () => {
            expect(() => factorial(-1)).toThrow('Factorial is not defined for negative numbers');
        });
    });

    describe('isEven', () => {
        test('should return true for even numbers', () => {
            expect(isEven(4)).toBe(true);
        });

        test('should return false for odd numbers', () => {
            expect(isEven(3)).toBe(false);
        });
    });

    describe('isPrime', () => {
        test('should return false for numbers less than 2', () => {
            expect(isPrime(0)).toBe(false);
            expect(isPrime(1)).toBe(false);
            expect(isPrime(-5)).toBe(false);
        });

        test('should return true for prime numbers', () => {
            expect(isPrime(2)).toBe(true);
            expect(isPrime(3)).toBe(true);
            expect(isPrime(5)).toBe(true);
            expect(isPrime(7)).toBe(true);
            expect(isPrime(11)).toBe(true);
            expect(isPrime(13)).toBe(true);
        });

        test('should return false for composite numbers', () => {
            expect(isPrime(4)).toBe(false);
            expect(isPrime(6)).toBe(false);
            expect(isPrime(8)).toBe(false);
            expect(isPrime(9)).toBe(false);
            expect(isPrime(10)).toBe(false);
            expect(isPrime(12)).toBe(false);
        });
    });

    describe('max', () => {
        test('should return maximum from array', () => {
            expect(max([1, 5, 3, 9, 2])).toBe(9);
        });

        test('should throw error for empty array', () => {
            expect(() => max([])).toThrow('Cannot find max of empty array');
        });
    });

    describe('min', () => {
        test('should return minimum from array', () => {
            expect(min([1, 5, 3, 9, 2])).toBe(1);
        });

        test('should throw error for empty array', () => {
            expect(() => min([])).toThrow('Cannot find min of empty array');
        });
    });

    describe('average', () => {
        test('should calculate average of array', () => {
            expect(average([1, 2, 3, 4, 5])).toBe(3);
            expect(average([10, 20, 30])).toBe(20);
        });

        test('should throw error for empty array', () => {
            expect(() => average([])).toThrow('Cannot calculate average of empty array');
        });
    });

    describe('power', () => {
        test('should calculate power correctly', () => {
            expect(power(2, 3)).toBe(8);
            expect(power(5, 2)).toBe(25);
            expect(power(10, 0)).toBe(1);
        });

        test('should handle negative exponents', () => {
            expect(power(2, -2)).toBe(0.25);
            expect(power(4, -1)).toBe(0.25);
        });
    });

    describe('sqrt', () => {
        test('should calculate square root', () => {
            expect(sqrt(4)).toBeCloseTo(2, 5);
            expect(sqrt(9)).toBeCloseTo(3, 5);
            expect(sqrt(16)).toBeCloseTo(4, 5);
            expect(sqrt(0)).toBe(0);
            expect(sqrt(1)).toBe(1);
        });

        test('should throw error for negative numbers', () => {
            expect(() => sqrt(-1)).toThrow('Cannot calculate square root of negative number');
        });
    });

    describe('gcd', () => {
        test('should calculate greatest common divisor', () => {
            expect(gcd(12, 8)).toBe(4);
            expect(gcd(54, 24)).toBe(6);
            expect(gcd(17, 13)).toBe(1);
        });

        test('should handle negative numbers', () => {
            expect(gcd(-12, 8)).toBe(4);
            expect(gcd(12, -8)).toBe(4);
            expect(gcd(-12, -8)).toBe(4);
        });
    });

    describe('lcm', () => {
        test('should calculate least common multiple', () => {
            expect(lcm(12, 8)).toBe(24);
            expect(lcm(4, 6)).toBe(12);
            expect(lcm(7, 5)).toBe(35);
        });

        test('should return 0 when one number is 0', () => {
            expect(lcm(0, 5)).toBe(0);
            expect(lcm(5, 0)).toBe(0);
        });
    });

    describe('fibonacci', () => {
        test('should generate fibonacci sequence', () => {
            expect(fibonacci(1)).toEqual([0]);
            expect(fibonacci(2)).toEqual([0, 1]);
            expect(fibonacci(6)).toEqual([0, 1, 1, 2, 3, 5]);
            expect(fibonacci(8)).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
        });

        test('should return empty array for n <= 0', () => {
            expect(fibonacci(0)).toEqual([]);
            expect(fibonacci(-5)).toEqual([]);
        });
    });

    describe('isPerfectSquare', () => {
        test('should return true for perfect squares', () => {
            expect(isPerfectSquare(0)).toBe(true);
            expect(isPerfectSquare(1)).toBe(true);
            expect(isPerfectSquare(4)).toBe(true);
            expect(isPerfectSquare(9)).toBe(true);
            expect(isPerfectSquare(16)).toBe(true);
            expect(isPerfectSquare(25)).toBe(true);
        });

        test('should return false for non-perfect squares', () => {
            expect(isPerfectSquare(2)).toBe(false);
            expect(isPerfectSquare(3)).toBe(false);
            expect(isPerfectSquare(5)).toBe(false);
            expect(isPerfectSquare(8)).toBe(false);
            expect(isPerfectSquare(10)).toBe(false);
        });

        test('should return false for negative numbers', () => {
            expect(isPerfectSquare(-1)).toBe(false);
            expect(isPerfectSquare(-4)).toBe(false);
        });
    });

    describe('degreesToRadians', () => {
        test('should convert degrees to radians', () => {
            expect(degreesToRadians(0)).toBe(0);
            expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2, 5);
            expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 5);
            expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI, 5);
        });
    });

    describe('radiansToDegrees', () => {
        test('should convert radians to degrees', () => {
            expect(radiansToDegrees(0)).toBe(0);
            expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90, 5);
            expect(radiansToDegrees(Math.PI)).toBeCloseTo(180, 5);
            expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360, 5);
        });
    });

    describe('circleArea', () => {
        test('should calculate area of circle', () => {
            expect(circleArea(1)).toBeCloseTo(Math.PI, 5);
            expect(circleArea(2)).toBeCloseTo(4 * Math.PI, 5);
            expect(circleArea(0)).toBe(0);
        });

        test('should throw error for negative radius', () => {
            expect(() => circleArea(-1)).toThrow('Radius cannot be negative');
        });
    });

    describe('circleCircumference', () => {
        test('should calculate circumference of circle', () => {
            expect(circleCircumference(1)).toBeCloseTo(2 * Math.PI, 5);
            expect(circleCircumference(2)).toBeCloseTo(4 * Math.PI, 5);
            expect(circleCircumference(0)).toBe(0);
        });

        test('should throw error for negative radius', () => {
            expect(() => circleCircumference(-1)).toThrow('Radius cannot be negative');
        });
    });

    describe('randomInt', () => {
        test('should generate random integer within range', () => {
            const result = randomInt(1, 10);
            expect(result).toBeGreaterThanOrEqual(1);
            expect(result).toBeLessThanOrEqual(10);
            expect(Number.isInteger(result)).toBe(true);
        });

        test('should handle same min and max', () => {
            expect(randomInt(5, 5)).toBe(5);
        });

        test('should throw error when min > max', () => {
            expect(() => randomInt(10, 5)).toThrow('Min cannot be greater than max');
        });
    });

    describe('compoundInterest', () => {
        test('should calculate compound interest', () => {
            const result = compoundInterest(1000, 0.05, 2);
            expect(result).toBeCloseTo(1102.5, 2);
        });

        test('should handle different compounding frequencies', () => {
            const result = compoundInterest(1000, 0.04, 1, 4);
            expect(result).toBeCloseTo(1040.6, 1);
        });

        test('should throw error for invalid parameters', () => {
            expect(() => compoundInterest(-1000, 0.05, 1)).toThrow('Invalid input parameters');
            expect(() => compoundInterest(1000, -0.05, 1)).toThrow('Invalid input parameters');
            expect(() => compoundInterest(1000, 0.05, -1)).toThrow('Invalid input parameters');
            expect(() => compoundInterest(1000, 0.05, 1, 0)).toThrow('Invalid input parameters');
        });
    });

    describe('distance', () => {
        test('should calculate distance between two points', () => {
            expect(distance(0, 0, 3, 4)).toBe(5);
            expect(distance(1, 1, 4, 5)).toBe(5);
            expect(distance(0, 0, 0, 0)).toBe(0);
        });

        test('should handle negative coordinates', () => {
            expect(distance(-3, -4, 0, 0)).toBe(5);
            expect(distance(0, 0, -3, -4)).toBe(5);
        });
    });

    describe('median', () => {
        test('should calculate median for odd-length arrays', () => {
            expect(median([1, 3, 5])).toBe(3);
            expect(median([7, 2, 9, 1, 5])).toBe(5);
            expect(median([10])).toBe(10);
        });

        test('should calculate median for even-length arrays', () => {
            expect(median([1, 2, 3, 4])).toBe(2.5);
            expect(median([10, 20])).toBe(15);
            expect(median([1, 3, 5, 7])).toBe(4);
        });

        test('should handle unsorted arrays', () => {
            expect(median([5, 1, 9, 3, 7])).toBe(5);
            expect(median([8, 2, 10, 4, 6, 12])).toBe(7);
        });

        test('should handle arrays with duplicate values', () => {
            expect(median([1, 1, 1])).toBe(1);
            expect(median([2, 2, 3, 3])).toBe(2.5);
            expect(median([5, 1, 5, 1, 5])).toBe(5);
        });

        test('should handle negative numbers', () => {
            expect(median([-1, -3, -5])).toBe(-3);
            expect(median([-10, 5, 0, -2])).toBe(-1);
        });

        test('should throw error for empty array', () => {
            expect(() => median([])).toThrow('Cannot calculate median of empty array');
        });
    });

    describe('isLeapYear', () => {
        test('should return true for leap years divisible by 4 but not 100', () => {
            expect(isLeapYear(2020)).toBe(true);
            expect(isLeapYear(2024)).toBe(true);
            expect(isLeapYear(2028)).toBe(true);
            expect(isLeapYear(1996)).toBe(true);
        });

        test('should return false for non-leap years not divisible by 4', () => {
            expect(isLeapYear(2021)).toBe(false);
            expect(isLeapYear(2022)).toBe(false);
            expect(isLeapYear(2023)).toBe(false);
            expect(isLeapYear(1999)).toBe(false);
        });

        test('should return false for years divisible by 100 but not 400', () => {
            expect(isLeapYear(1700)).toBe(false);
            expect(isLeapYear(1800)).toBe(false);
            expect(isLeapYear(1900)).toBe(false);
            expect(isLeapYear(2100)).toBe(false);
        });

        test('should return true for years divisible by 400', () => {
            expect(isLeapYear(1600)).toBe(true);
            expect(isLeapYear(2000)).toBe(true);
            expect(isLeapYear(2400)).toBe(true);
        });

        test('should handle edge cases', () => {
            expect(isLeapYear(4)).toBe(true);
            expect(isLeapYear(100)).toBe(false);
            expect(isLeapYear(400)).toBe(true);
            expect(isLeapYear(0)).toBe(true); // Year 0 is divisible by 400
        });
    });

    describe('percentageChange', () => {
        test('should calculate positive percentage change', () => {
            expect(percentageChange(100, 150)).toBe(50);
            expect(percentageChange(50, 75)).toBe(50);
            expect(percentageChange(200, 250)).toBe(25);
        });

        test('should calculate negative percentage change', () => {
            expect(percentageChange(100, 75)).toBe(-25);
            expect(percentageChange(200, 150)).toBe(-25);
            expect(percentageChange(50, 25)).toBe(-50);
        });

        test('should handle zero change', () => {
            expect(percentageChange(100, 100)).toBe(0);
            expect(percentageChange(50, 50)).toBe(0);
            expect(percentageChange(-10, -10)).toBe(0);
        });

        test('should handle negative old values', () => {
            expect(percentageChange(-100, -50)).toBe(50);
            expect(percentageChange(-50, -75)).toBe(-50);
            expect(percentageChange(-10, 10)).toBe(200);
        });

        test('should handle mixed positive/negative values', () => {
            expect(percentageChange(100, -50)).toBe(-150);
            expect(percentageChange(-100, 50)).toBe(150);
        });

        test('should handle zero old value', () => {
            expect(percentageChange(0, 0)).toBe(0);
            expect(percentageChange(0, 100)).toBe(Infinity);
            expect(percentageChange(0, -100)).toBe(-Infinity);
        });

        test('should handle decimal values', () => {
            expect(percentageChange(10.5, 12.6)).toBeCloseTo(20, 1);
            expect(percentageChange(3.33, 6.66)).toBeCloseTo(100, 1);
        });
    });

    describe('isPalindrome', () => {
        test('should return true for single digit numbers', () => {
            expect(isPalindrome(0)).toBe(true);
            expect(isPalindrome(1)).toBe(true);
            expect(isPalindrome(5)).toBe(true);
            expect(isPalindrome(9)).toBe(true);
        });

        test('should return true for palindromic numbers', () => {
            expect(isPalindrome(11)).toBe(true);
            expect(isPalindrome(121)).toBe(true);
            expect(isPalindrome(1221)).toBe(true);
            expect(isPalindrome(12321)).toBe(true);
            expect(isPalindrome(123321)).toBe(true);
        });

        test('should return false for non-palindromic numbers', () => {
            expect(isPalindrome(12)).toBe(false);
            expect(isPalindrome(123)).toBe(false);
            expect(isPalindrome(1234)).toBe(false);
            expect(isPalindrome(12345)).toBe(false);
        });

        test('should handle larger palindromic numbers', () => {
            expect(isPalindrome(1234321)).toBe(true);
            expect(isPalindrome(9876789)).toBe(true);
            expect(isPalindrome(1001)).toBe(true);
            expect(isPalindrome(90109)).toBe(true);
        });

        test('should handle larger non-palindromic numbers', () => {
            expect(isPalindrome(1234567)).toBe(false);
            expect(isPalindrome(9876543)).toBe(false);
            expect(isPalindrome(1002)).toBe(false);
            expect(isPalindrome(90108)).toBe(false);
        });

        test('should return false for negative numbers', () => {
            expect(isPalindrome(-1)).toBe(false);
            expect(isPalindrome(-11)).toBe(false);
            expect(isPalindrome(-121)).toBe(false);
            expect(isPalindrome(-12321)).toBe(false);
        });

        test('should handle numbers with trailing zeros', () => {
            expect(isPalindrome(10)).toBe(false);
            expect(isPalindrome(100)).toBe(false);
            expect(isPalindrome(1000)).toBe(false);
            expect(isPalindrome(101)).toBe(true);
        });
    });

    describe('clamp', () => {
        test('should return the value when it is within the range', () => {
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(7.5, 5, 10)).toBe(7.5);
            expect(clamp(-2, -5, 5)).toBe(-2);
        });

        test('should return the minimum when value is below range', () => {
            expect(clamp(-5, 0, 10)).toBe(0);
            expect(clamp(2, 5, 10)).toBe(5);
            expect(clamp(-10, -5, 5)).toBe(-5);
        });

        test('should return the maximum when value is above range', () => {
            expect(clamp(15, 0, 10)).toBe(10);
            expect(clamp(12, 5, 10)).toBe(10);
            expect(clamp(10, -5, 5)).toBe(5);
        });

        test('should handle edge cases at boundaries', () => {
            expect(clamp(0, 0, 10)).toBe(0);  // At minimum
            expect(clamp(10, 0, 10)).toBe(10); // At maximum
            expect(clamp(5, 5, 5)).toBe(5);    // Min equals max equals value
        });

        test('should handle negative ranges', () => {
            expect(clamp(-3, -10, -1)).toBe(-3);
            expect(clamp(-15, -10, -1)).toBe(-10);
            expect(clamp(0, -10, -1)).toBe(-1);
        });

        test('should handle decimal values', () => {
            expect(clamp(2.5, 0, 5)).toBe(2.5);
            expect(clamp(-0.5, 0, 5)).toBe(0);
            expect(clamp(7.8, 0, 5)).toBe(5);
            expect(clamp(3.14159, 3.14, 3.15)).toBeCloseTo(3.14159, 5);
        });

        test('should handle zero as min or max', () => {
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-5, -10, 0)).toBe(-5);
            expect(clamp(1, 0, 0)).toBe(0);
            expect(clamp(-1, 0, 0)).toBe(0);
        });

        test('should throw error when min is greater than max', () => {
            expect(() => clamp(5, 10, 5)).toThrow('Minimum value cannot be greater than maximum value');
            expect(() => clamp(0, 1, -1)).toThrow('Minimum value cannot be greater than maximum value');
            expect(() => clamp(-5, 0, -10)).toThrow('Minimum value cannot be greater than maximum value');
        });

        test('should handle very large numbers', () => {
            expect(clamp(1000000, 0, 999999)).toBe(999999);
            expect(clamp(-1000000, -999999, 0)).toBe(-999999);
            expect(clamp(500000, 0, 1000000)).toBe(500000);
        });
    });

    describe('fibonacciNumber', () => {
        test('should return correct fibonacci numbers for small values', () => {
            expect(fibonacciNumber(0)).toBe(0);
            expect(fibonacciNumber(1)).toBe(1);
            expect(fibonacciNumber(2)).toBe(1);
            expect(fibonacciNumber(3)).toBe(2);
            expect(fibonacciNumber(4)).toBe(3);
            expect(fibonacciNumber(5)).toBe(5);
            expect(fibonacciNumber(6)).toBe(8);
            expect(fibonacciNumber(7)).toBe(13);
        });

        test('should return correct fibonacci numbers for larger values', () => {
            expect(fibonacciNumber(10)).toBe(55);
            expect(fibonacciNumber(15)).toBe(610);
            expect(fibonacciNumber(20)).toBe(6765);
        });

        test('should handle edge cases', () => {
            expect(fibonacciNumber(8)).toBe(21);
            expect(fibonacciNumber(9)).toBe(34);
            expect(fibonacciNumber(12)).toBe(144);
        });

        test('should throw error for negative numbers', () => {
            expect(() => fibonacciNumber(-1)).toThrow('Fibonacci number is not defined for negative numbers');
            expect(() => fibonacciNumber(-5)).toThrow('Fibonacci number is not defined for negative numbers');
            expect(() => fibonacciNumber(-10)).toThrow('Fibonacci number is not defined for negative numbers');
        });

        test('should be efficient for moderate values', () => {
            // Test that it can handle moderately large values efficiently
            expect(fibonacciNumber(30)).toBe(832040);
            expect(fibonacciNumber(25)).toBe(75025);
        });

        test('should maintain accuracy for sequence validation', () => {
            // Validate that consecutive fibonacci numbers follow the rule: F(n) = F(n-1) + F(n-2)
            const f10 = fibonacciNumber(10);
            const f11 = fibonacciNumber(11);
            const f12 = fibonacciNumber(12);
            
            expect(f12).toBe(f10 + f11);
            expect(f11).toBe(fibonacciNumber(9) + f10);
        });
    });
});
