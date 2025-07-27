/**
 * Mathematical utility functions for testing coverage
 */

/**
 * Add two numbers together
 */
export function add(a: number, b: number): number {
    return a + b;
}

/**
 * Subtract second number from first
 */
export function subtract(a: number, b: number): number {
    return a - b;
}

/**
 * Multiply two numbers
 */
export function multiply(a: number, b: number): number {
    return a * b;
}

/**
 * Divide first number by second
 */
export function divide(a: number, b: number): number {
    if (b === 0) {
        throw new Error('Division by zero is not allowed');
    }
    return a / b;
}

/**
 * Calculate the factorial of a number
 */
export function factorial(n: number): number {
    if (n < 0) {
        throw new Error('Factorial is not defined for negative numbers');
    }
    
    if (n === 0 || n === 1) {
        return 1;
    }
    
    return n * factorial(n - 1);
}

/**
 * Check if a number is even
 */
export function isEven(n: number): boolean {
    return n % 2 === 0;
}

/**
 * Check if a number is prime
 */
export function isPrime(n: number): boolean {
    if (n < 2) {
        return false;
    }
    
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            return false;
        }
    }
    
    return true;
}

/**
 * Get the maximum of an array of numbers
 */
export function max(numbers: number[]): number {
    if (numbers.length === 0) {
        throw new Error('Cannot find max of empty array');
    }
    
    return Math.max(...numbers);
}

/**
 * Get the minimum of an array of numbers
 */
export function min(numbers: number[]): number {
    if (numbers.length === 0) {
        throw new Error('Cannot find min of empty array');
    }
    
    return Math.min(...numbers);
}

/**
 * Calculate the average of an array of numbers
 */
export function average(numbers: number[]): number {
    if (numbers.length === 0) {
        throw new Error('Cannot calculate average of empty array');
    }
    
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

/**
 * Calculate the power of a number (UNTESTED - will reduce coverage)
 */
export function power(base: number, exponent: number): number {
    if (exponent === 0) {
        return 1;
    }
    
    if (exponent < 0) {
        return 1 / power(base, -exponent);
    }
    
    let result = 1;
    for (let i = 0; i < exponent; i++) {
        result *= base;
    }
    
    return result;
}

/**
 * Calculate the square root using Newton's method
 */
export function sqrt(n: number): number {
    if (n < 0) {
        throw new Error('Cannot calculate square root of negative number');
    }
    
    if (n === 0 || n === 1) {
        return n;
    }
    
    let guess = n / 2;
    let previousGuess;
    
    do {
        previousGuess = guess;
        guess = (guess + n / guess) / 2;
    } while (Math.abs(guess - previousGuess) > 0.000001);
    
    return guess;
}

/**
 * Calculate the greatest common divisor
 */
export function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    
    return a;
}

/**
 * Calculate the least common multiple
 */
export function lcm(a: number, b: number): number {
    if (a === 0 || b === 0) {
        return 0;
    }
    
    return Math.abs(a * b) / gcd(a, b);
}

/**
 * Generate Fibonacci sequence up to n terms
 */
export function fibonacci(n: number): number[] {
    if (n <= 0) {
        return [];
    }
    
    if (n === 1) {
        return [0];
    }
    
    const sequence = [0, 1];
    
    for (let i = 2; i < n; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    
    return sequence;
}

/**
 * Check if a number is a perfect square
 */
export function isPerfectSquare(n: number): boolean {
    if (n < 0) {
        return false;
    }
    
    const sqrtN = Math.floor(Math.sqrt(n));
    return sqrtN * sqrtN === n;
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Calculate the area of a circle
 */
export function circleArea(radius: number): number {
    if (radius < 0) {
        throw new Error('Radius cannot be negative');
    }
    
    return Math.PI * radius * radius;
}

/**
 * Calculate the circumference of a circle
 */
export function circleCircumference(radius: number): number {
    if (radius < 0) {
        throw new Error('Radius cannot be negative');
    }
    
    return 2 * Math.PI * radius;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
    if (min > max) {
        throw new Error('Min cannot be greater than max');
    }
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate compound interest
 */
export function compoundInterest(
    principal: number,
    rate: number,
    time: number,
    compoundingFrequency: number = 1
): number {
    if (principal < 0 || rate < 0 || time < 0 || compoundingFrequency <= 0) {
        throw new Error('Invalid input parameters');
    }
    
    return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * time);
}

/**
 * Calculate the distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

/**
 * Calculate the median of an array of numbers
 */
export function median(numbers: number[]): number {
    if (numbers.length === 0) {
        throw new Error('Cannot calculate median of empty array');
    }
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
        return sorted[middle];
    }
}

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
    if (year % 4 !== 0) {
        return false;
    }
    
    if (year % 100 !== 0) {
        return true;
    }
    
    if (year % 400 === 0) {
        return true;
    }
    
    return false;
}

/**
 * Calculate the percentage change between two values
 */
export function percentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) {
        if (newValue === 0) {
            return 0;
        }
        return newValue > 0 ? Infinity : -Infinity;
    }
    
    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Check if a number is a palindrome
 */
export function isPalindrome(n: number): boolean {
    if (n < 0) {
        return false;
    }
    
    const str = n.toString();
    const reversed = str.split('').reverse().join('');
    
    return str === reversed;
}

/**
 * Clamps a number between a specified minimum and maximum value
 */
export function clamp(value: number, min: number, max: number): number {
    if (min > max) {
        throw new Error('Minimum value cannot be greater than maximum value');
    }
    return Math.min(Math.max(value, min), max);
}

/**
 * Rounds a number to a specified number of decimal place
 */
export function round(value: number, decimals: number = 0): number {
    if (decimals < 0) {
        throw new Error('Number of decimal places cannot be negative');
    }
    if (!Number.isInteger(decimals)) {
        throw new Error('Number of decimal places must be an integer');
    }
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate the nth Fibonacci number (optimized iterative approach)
 */
export function fibonacciNumber(n: number): number {
    if (n < 0) {
        throw new Error('Fibonacci number is not defined for negative numbers');
    }
    
    if (n === 0) {
        return 0;
    }
    
    if (n === 1) {
        return 1;
    }
    
    let prev = 0;
    let curr = 1;
    
    for (let i = 2; i <= n; i++) {
        const next = prev + curr;
        prev = curr;
        curr = next;
    }
    
    return curr;
}

/**
 * Calculate the slope of a line given two points
 */
export function slope(x1: number, y1: number, x2: number, y2: number): number {
    if (x1 === x2) {
        throw new Error('Cannot calculate slope for vertical line (undefined slope)');
    }
    
    return (y2 - y1) / (x2 - x1);
}

/**
 * Calculate the hypotenuse of a right triangle given two sides
 */
export function hypotenuse(a: number, b: number): number {
    if (a < 0 || b < 0) {
        throw new Error('Side lengths cannot be negative');
    }
    
    if (a === 0 && b === 0) {
        return 0;
    }
    
    return Math.sqrt(a * a + b * b);
}

/**
 * Calculate the area of a triangle using Heron's formula
 */
export function triangleArea(a: number, b: number, c: number): number {
    if (a <= 0 || b <= 0 || c <= 0) {
        throw new Error('All side lengths must be positive');
    }
    
    // Check triangle inequality
    if (a + b <= c || a + c <= b || b + c <= a) {
        throw new Error('Invalid triangle: sides do not satisfy triangle inequality');
    }
    
    const s = (a + b + c) / 2; // semi-perimeter
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    
    return area;
}

/**
 * Convert a number from one base to another (up to base 36)
 */
export function convertBase(number: string, fromBase: number, toBase: number): string {
    if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
        throw new Error('Base must be between 2 and 36');
    }
    
    if (!number || number.trim() === '') {
        throw new Error('Number string cannot be empty');
    }
    
    // Convert from source base to decimal
    const decimal = parseInt(number, fromBase);
    
    if (isNaN(decimal)) {
        throw new Error('Invalid number for the specified base');
    }
    
    // Convert from decimal to target base
    return decimal.toString(toBase).toUpperCase();
}

/**
 * Calculate the sum of digits in a number
 */
export function digitSum(n: number): number {
    if (n < 0) {
        n = Math.abs(n); // Work with absolute value for negative numbers
    }
    
    if (n === 0) {
        return 0;
    }
    
    let sum = 0;
    while (n > 0) {
        sum += n % 10;
        n = Math.floor(n / 10);
    }
    
    return sum;
}
