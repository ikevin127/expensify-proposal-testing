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
