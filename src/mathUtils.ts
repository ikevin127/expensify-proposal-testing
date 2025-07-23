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
 * Calculate the square root using Newton's method (UNTESTED)
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
 * Calculate the greatest common divisor (UNTESTED)
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
 * Calculate the least common multiple (UNTESTED)
 */
export function lcm(a: number, b: number): number {
    if (a === 0 || b === 0) {
        return 0;
    }
    
    return Math.abs(a * b) / gcd(a, b);
}

/**
 * Generate Fibonacci sequence up to n terms (UNTESTED)
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
 * Check if a number is a perfect square (UNTESTED)
 */
export function isPerfectSquare(n: number): boolean {
    if (n < 0) {
        return false;
    }
    
    const sqrtN = Math.floor(Math.sqrt(n));
    return sqrtN * sqrtN === n;
}

/**
 * Convert degrees to radians (UNTESTED)
 */
export function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees (UNTESTED)
 */
export function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Calculate the area of a circle (UNTESTED)
 */
export function circleArea(radius: number): number {
    if (radius < 0) {
        throw new Error('Radius cannot be negative');
    }
    
    return Math.PI * radius * radius;
}

/**
 * Calculate the circumference of a circle (UNTESTED)
 */
export function circleCircumference(radius: number): number {
    if (radius < 0) {
        throw new Error('Radius cannot be negative');
    }
    
    return 2 * Math.PI * radius;
}

/**
 * Generate a random integer between min and max (inclusive) (UNTESTED)
 */
export function randomInt(min: number, max: number): number {
    if (min > max) {
        throw new Error('Min cannot be greater than max');
    }
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
