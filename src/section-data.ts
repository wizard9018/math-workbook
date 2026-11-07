// Grade 9 5.1 exercises 2-10 (bank/G9-ch5/s1/items.json part counts). Imported by quiz.tsx (left roadmap) and roadmap.tsx.
export interface Node {
  no: number
  name: string
  parts: number
  how: string // how the lesson would work
  state: 'ready' | 'next' | 'later' | 'figure'
}

export const NODES: Node[] = [
  { no: 2, name: 'Identify polynomials', parts: 10, how: 'Yes / No. Wrong: the textbook examples and one question (which non-monomial is it like?), then 3 similar questions.', state: 'ready' },
  { no: 3, name: 'Find the degree', parts: 10, how: 'Choose the degree. Wrong: pick the term of highest degree, find its degree, then 3 similar questions.', state: 'ready' },
  { no: 4, name: 'Find the coefficient', parts: 8, how: 'Choose the coefficient. Wrong: the textbook table (term and coefficient), the same question again, then 3 similar questions.', state: 'ready' },
  { no: 5, name: 'Order the terms', parts: 6, how: 'Choose the descending order. Wrong: the textbook examples, the same question again, then 3 similar questions.', state: 'ready' },
  { no: 8, name: 'Collect like terms', parts: 20, how: 'Choose the simplified polynomial. Wrong: the like / unlike terms, one question per group of like terms, then the descending order, then 3 similar questions.', state: 'ready' },
  { no: 10, name: 'Collect like terms (with fractions)', parts: 18, how: 'Same as 8, with fraction and decimal coefficients.', state: 'ready' },
  { no: 18, name: 'Challenge: Collect like terms', parts: 4, how: 'Harder: 8 to 10 terms and up to three letters. Optional extra practice.', state: 'ready' },
]

// Grade 9 5.2 exercises 1-7, all horizontal. `no` is the key of the quiz page (100 + the exercise number); `show` is the number printed in the roadmap.
export const NODES52: (Node & { show: number })[] = [
  { no: 101, show: 1, name: 'Add polynomials', parts: 16, how: 'Choose the simplified sum. Wrong: take the brackets off, then collect like terms.', state: 'ready' },
  { no: 102, show: 2, name: 'Add (vertical)', parts: 14, how: 'Like terms in the same column, added column by column.', state: 'ready' },
  { no: 104, show: 4, name: 'Subtract polynomials', parts: 16, how: 'Wrong: a minus in front of a bracket changes every sign inside, then collect like terms.', state: 'ready' },
  { no: 105, show: 5, name: 'Subtract (vertical)', parts: 14, how: 'Change the signs of the lower row, then add column by column.', state: 'ready' },
  { no: 107, show: 7, name: 'Combined operations', parts: 14, how: 'Three brackets with plus and minus signs.', state: 'ready' },
  { no: 108, show: 8, name: 'Perimeter of a figure', parts: 8, how: 'Choose the perimeter. Wrong: work out the sides that are not given, take the brackets off, collect like terms.', state: 'ready' },
  { no: 109, show: 9, name: 'Perimeter (harder figures)', parts: 8, how: 'Same as 8, with missing sides, circles and right triangles.', state: 'ready' },
  { no: 110, show: 10, name: 'Surface area', parts: 8, how: 'Boxes, a prism and cylinders: the area of every face, then the sum.', state: 'ready' },
  { no: 111, show: 11, name: 'Challenge: Add polynomials', parts: 4, how: 'Harder: three brackets, more terms, more letters. Optional extra practice.', state: 'ready' },
  { no: 114, show: 14, name: 'Challenge: Subtract polynomials', parts: 4, how: 'Harder: three brackets, more terms, more letters. Optional extra practice.', state: 'ready' },
  { no: 117, show: 17, name: 'Challenge: Combined operations', parts: 4, how: 'Harder: three brackets, more terms, more letters. Optional extra practice.', state: 'ready' },
]

// Grade 9 5.3 exercises 1-3 and 6-11 (4 and 5 use algebra tiles). `no` is the key of the quiz page (200 + the exercise number); `show` is the number printed in the roadmap.
export const NODES53: (Node & { show: number })[] = [
  { no: 201, show: 1, name: 'Multiply monomials', parts: 10, how: 'Multiply the numbers, then the letters (the exponents add up).', state: 'ready' },
  { no: 202, show: 2, name: 'Monomial times binomial', parts: 20, how: 'Multiply the monomial by every term in the bracket, then collect.', state: 'ready' },
  { no: 203, show: 3, name: 'Distributive property', parts: 23, how: 'Brackets with two or three terms.', state: 'ready' },
  { no: 206, show: 6, name: 'Area', parts: 4, how: 'Formula, one half, then multiply every term of the bracket.', state: 'ready' },
  { no: 207, show: 7, name: 'Volume', parts: 4, how: 'Formula, multiply the monomials, then the bracket.', state: 'ready' },
  { no: 209, show: 9, name: 'Surface area', parts: 6, how: 'The area of every face, then the sum.', state: 'ready' },
  { no: 212, show: 12, name: 'Challenge: Monomial times polynomial', parts: 4, how: 'Harder: bigger numbers, two letters, up to four terms. Optional extra practice.', state: 'ready' },
]

export const NODES54: (Node & { show: number })[] = [
  { no: 301, show: 1, name: 'Divide by a number', parts: 12, how: 'Divide every term on top by the bottom.', state: 'ready' },
  { no: 302, show: 2, name: 'Divide three terms', parts: 10, how: 'Divide every term on top by the bottom.', state: 'ready' },
  { no: 303, show: 3, name: 'Divide by a monomial', parts: 20, how: 'Divide the numbers, then the letters (the exponents subtract).', state: 'ready' },
  { no: 305, show: 5, name: 'Find the height', parts: 4, how: 'Formula, then divide the area or the volume.', state: 'ready' },
  { no: 306, show: 6, name: 'Word problems', parts: 4, how: 'The formula, then divide: square, parallelogram, pool, pyramid.', state: 'ready' },
  { no: 310, show: 10, name: 'Combined operations', parts: 12, how: 'Work out each part, then collect like terms.', state: 'ready' },
  { no: 313, show: 13, name: 'Challenge: Divide by a monomial', parts: 4, how: 'Harder: up to four terms, two letters. Optional extra practice.', state: 'ready' },
]

export const NODES55: (Node & { show: number })[] = [
  { no: 401, show: 1, name: 'Degree', parts: 4, how: 'The degree of each term, then the polynomial.', state: 'ready' },
  { no: 402, show: 2, name: 'Simplify', parts: 4, how: 'Collect like terms.', state: 'ready' },
  { no: 404, show: 4, name: 'Add', parts: 4, how: 'Remove the brackets, then collect like terms.', state: 'ready' },
  { no: 406, show: 6, name: 'Subtract', parts: 4, how: 'Change every sign in the second bracket, then collect.', state: 'ready' },
  { no: 407, show: 7, name: 'Product', parts: 12, how: 'Multiply the monomial by every term in the bracket.', state: 'ready' },
  { no: 408, show: 8, name: 'Quotient', parts: 8, how: 'Divide every term on top by the bottom.', state: 'ready' },
  { no: 409, show: 9, name: 'Combined operations', parts: 6, how: 'Work out each part, then collect like terms.', state: 'ready' },
]

export const NODES61: (Node & { show: number })[] = [
  { no: 501, show: 1, name: 'Is it a solution?', parts: 10, how: 'Put the value in and compare the two sides.', state: 'ready' },
  { no: 502, show: 2, name: 'Solve an equation', parts: 10, how: 'Do the same to both sides.', state: 'ready' },
  { no: 503, show: 3, name: 'Fraction coefficient', parts: 10, how: 'Multiply both sides by the reciprocal.', state: 'ready' },
  { no: 504, show: 4, name: 'Variable in a fraction', parts: 10, how: 'Multiply both sides by the denominator.', state: 'ready' },
  { no: 505, show: 5, name: 'Several terms', parts: 18, how: 'Collect like terms, then solve.', state: 'ready' },
  { no: 508, show: 8, name: 'Solve for a letter', parts: 8, how: 'Do the opposite to both sides.', state: 'ready' },
  { no: 509, show: 9, name: 'Words to equations', parts: 6, how: 'Turn every phrase into math.', state: 'ready' },
  { no: 510, show: 10, name: 'Word problems', parts: 8, how: 'Choose x, write the equation, solve, answer.', state: 'ready' },
  { no: 512, show: 12, name: 'Challenge: Solve an equation (bigger numbers)', parts: 4, how: 'Do the same to both sides.', state: 'ready' },
  { no: 513, show: 13, name: 'Challenge: Fraction coefficient', parts: 4, how: 'Multiply both sides by the reciprocal.', state: 'ready' },
  { no: 515, show: 15, name: 'Challenge: Several terms', parts: 4, how: 'Collect like terms, then solve.', state: 'ready' },
]

export const NODES62: (Node & { show: number })[] = [
  { no: 601, show: 1, name: 'Fractions', parts: 16, how: 'Multiply every term by the LCD, then solve.', state: 'ready' },
  { no: 602, show: 2, name: 'Fractions and brackets', parts: 14, how: 'Remove the brackets, clear the fractions, solve.', state: 'ready' },
  { no: 603, show: 3, name: 'Decimals', parts: 14, how: 'Multiply by a power of 10, then solve.', state: 'ready' },
  { no: 604, show: 4, name: 'Decimals and brackets', parts: 14, how: 'Remove the brackets, clear the decimals, solve.', state: 'ready' },
  { no: 605, show: 5, name: 'Word problems', parts: 8, how: 'Choose x, write the equation, solve, answer.', state: 'ready' },
  { no: 611, show: 11, name: 'Challenge: Fractions', parts: 4, how: 'Multiply every term by the LCD, then solve.', state: 'ready' },
  { no: 612, show: 12, name: 'Challenge: Fractions and brackets', parts: 4, how: 'Remove the brackets, multiply by the LCD, then solve.', state: 'ready' },
  { no: 613, show: 13, name: 'Challenge: Decimals', parts: 4, how: 'Multiply by a power of 10, then solve.', state: 'ready' },
  { no: 614, show: 14, name: 'Challenge: Decimals and brackets', parts: 4, how: 'Remove the brackets, multiply by a power of 10, then solve.', state: 'ready' },
]

export const NODES63: (Node & { show: number })[] = [
  { no: 701, show: 1, name: 'True or false', parts: 10, how: 'Write both numbers in the same form, then compare.', state: 'ready' },
  { no: 702, show: 2, name: 'Words to inequalities', parts: 10, how: 'Turn every phrase into math.', state: 'ready' },
  { no: 703, show: 3, name: 'Graph on a number line', parts: 10, how: 'A closed or open circle, and the direction.', state: 'ready' },
  { no: 705, show: 5, name: 'Number line to inequality', parts: 5, how: 'Read the circle, the direction and the number.', state: 'ready' },
  { no: 706, show: 6, name: 'Sentence to number line', parts: 8, how: 'Write the sentence in math, then the circles and the direction.', state: 'ready' },
]

export const NODES64: (Node & { show: number })[] = [
  { no: 803, show: 3, name: 'Solve and graph', parts: 16, how: 'Move the variable, move the number, then the circle and the direction.', state: 'ready' },
  { no: 804, show: 4, name: 'The variable cancels', parts: 4, how: 'Both sides without x: true or false, all numbers or none.', state: 'ready' },
  { no: 805, show: 5, name: 'Equivalent, word problems', parts: 6, how: 'A number that tells them apart; the average, the rectangle and the triangles.', state: 'ready' },
]

export const NODES65: (Node & { show: number })[] = [
  { no: 902, show: 2, name: 'One step', parts: 12, how: 'Divide by the number in front; a negative number turns the sign round.', state: 'ready' },
  { no: 903, show: 3, name: 'Several steps', parts: 16, how: 'Move the terms, collect, divide.', state: 'ready' },
  { no: 904, show: 4, name: 'Fractions and brackets', parts: 13, how: 'Multiply by the LCD, remove the brackets, solve.', state: 'ready' },
  { no: 905, show: 5, name: 'Decimals', parts: 5, how: 'Multiply by a power of 10, then solve.', state: 'ready' },
  { no: 906, show: 6, name: 'Word problems', parts: 6, how: 'Write the inequality, solve, answer.', state: 'ready' },
  { no: 913, show: 13, name: 'Challenge: Several steps', parts: 4, how: 'Move the terms, collect, divide; a negative number turns the sign round.', state: 'ready' },
  { no: 914, show: 14, name: 'Challenge: Fractions and brackets', parts: 4, how: 'Multiply by the LCD, then solve.', state: 'ready' },
  { no: 915, show: 15, name: 'Challenge: Decimals', parts: 4, how: 'Multiply by a power of 10, then solve.', state: 'ready' },
]

export const NODES66: (Node & { show: number })[] = [
  { no: 1002, show: 2, name: 'Pressure', parts: 6, how: 'Rate of change, change from the first point, answer; interpolation or extrapolation.', state: 'ready' },
  { no: 1003, show: 3, name: 'Tea', parts: 5, how: 'Same steps: a price, an amount, interpolation or extrapolation.', state: 'ready' },
  { no: 1004, show: 4, name: 'Other trends', parts: 5, how: 'Voters, population, marathon and waste: the year.', state: 'ready' },
  { no: 1005, show: 5, name: 'Vegetables', parts: 4, how: 'A year or an amount.', state: 'ready' },
  { no: 1007, show: 7, name: 'Tuition', parts: 5, how: 'A year or a fee; interpolation or extrapolation.', state: 'ready' },
  { no: 1010, show: 10, name: 'Medals', parts: 2, how: 'Predict the next count.', state: 'ready' },
]

export const NODES41: (Node & { show: number })[] = [
  { no: 1101, show: 1, name: 'Evaluate A = 3p', parts: 6, how: 'Substitute the value, then calculate.', state: 'ready' },
  { no: 1102, show: 2, name: 'Evaluate S = 4n - 2', parts: 6, how: 'Substitute, remove the brackets, collect.', state: 'ready' },
  { no: 1103, show: 3, name: 'Common difference', parts: 8, how: 'The second term minus the first term.', state: 'ready' },
  { no: 1104, show: 4, name: 'Next three numbers', parts: 8, how: 'The common difference, then add it three times.', state: 'ready' },
  { no: 1105, show: 5, name: 'Equation from a table', parts: 6, how: 'The common difference, the number added, the equation.', state: 'ready' },
  { no: 1106, show: 6, name: 'The 50th term', parts: 6, how: 'The common difference, 49 of them, the first term plus that.', state: 'ready' },
  { no: 1107, show: 7, name: 'Word problems', parts: 8, how: 'Yearbook, car rental, tournament, graduation: an equation or a value.', state: 'ready' },
  { no: 1113, show: 13, name: 'Challenge: Common difference', parts: 4, how: 'Harder: bigger, negative and decimal differences. Optional extra practice.', state: 'ready' },
  { no: 1114, show: 14, name: 'Challenge: Next three numbers', parts: 4, how: 'Harder: bigger, negative and decimal differences. Optional extra practice.', state: 'ready' },
  { no: 1115, show: 15, name: 'Challenge: Equation from a table', parts: 4, how: 'Harder: bigger, negative and decimal differences. Optional extra practice.', state: 'ready' },
  { no: 1116, show: 16, name: 'Challenge: The 100th term', parts: 4, how: 'Harder: bigger, negative and decimal differences. Optional extra practice.', state: 'ready' },
]

export const NODES11: (Node & { show: number })[] = [
  { no: 2202, show: 2, name: 'Sets of a number', parts: 7, how: 'Tick every set the number belongs to, then Submit. Lesson: what kind of number, then its sets.', state: 'ready' },
  { no: 2203, show: 3, name: 'Numbers of a set', parts: 5, how: 'Tick the numbers of the set that are natural / whole / integers / rational / irrational, then Submit.', state: 'ready' },
  { no: 2212, show: 12, name: 'Challenge: Sets of numbers', parts: 4, how: 'Harder: numbers in disguise. Optional extra practice.', state: 'ready' },
  { no: 2213, show: 13, name: 'Challenge: Numbers of a set', parts: 5, how: 'Harder: bigger sets of 12 numbers. Optional extra practice.', state: 'ready' },
]

export const NODES12: (Node & { show: number })[] = [
  { no: 2302, show: 2, name: 'Simplify a square root', parts: 10, how: 'Which number times itself gives it? A negative number has no root.', state: 'ready' },
  { no: 2303, show: 3, name: 'Sums of roots', parts: 10, how: 'Take each root, then add; or add under the root first, then take the root.', state: 'ready' },
  { no: 2305, show: 5, name: 'The rational square root', parts: 12, how: 'A perfect square has a rational root; otherwise there is none.', state: 'ready' },
  { no: 2306, show: 6, name: 'Word problems', parts: 11, how: 'Exercises 6 to 15 of the book: area, volume, calories; find the square, then take the root.', state: 'ready' },
  { no: 2312, show: 12, name: 'Challenge: Simplify a square root', parts: 4, how: 'Harder: bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 2313, show: 13, name: 'Challenge: Simplify', parts: 4, how: 'Harder: bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 2315, show: 15, name: 'Challenge: The rational square root', parts: 4, how: 'Harder: bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 2316, show: 16, name: 'Challenge: Word problems', parts: 4, how: 'Harder: bigger numbers. Optional extra practice.', state: 'ready' },
]

export const NODES13: (Node & { show: number })[] = [
  { no: 2401, show: 1, name: 'Rational or irrational', parts: 10, how: 'Write it as a fraction in lowest terms; both top and bottom must be perfect squares.', state: 'ready' },
  { no: 2402, show: 2, name: 'Between two integers', parts: 10, how: 'The perfect squares on each side, then their roots.', state: 'ready' },
  { no: 2403, show: 3, name: 'The closest integer', parts: 10, how: 'Which perfect square is closer?', state: 'ready' },
  { no: 2404, show: 4, name: 'One decimal place', parts: 10, how: 'The integers around the root, then the tenth.', state: 'ready' },
  { no: 2405, show: 5, name: "Heron's method", parts: 10, how: 'The first guess, x divided by the guess, the average.', state: 'ready' },
  { no: 2407, show: 7, name: 'Pythagorean triples', parts: 7, how: 'a² + b², then c², then compare.', state: 'ready' },
  { no: 2408, show: 8, name: 'Baseball', parts: 3, how: 'The legs of a right triangle, the distance squared, the square root.', state: 'ready' },
  { no: 2411, show: 11, name: 'Challenge: Rational or irrational', parts: 4, how: 'Harder: bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 2412, show: 12, name: 'Challenge: Between two integers', parts: 4, how: 'Harder: bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 2413, show: 13, name: 'Challenge: The closest integer', parts: 4, how: 'Harder: bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 2414, show: 14, name: 'Challenge: One decimal place', parts: 4, how: 'Harder: bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 2415, show: 15, name: "Challenge: Heron's method", parts: 4, how: 'Harder: bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 2417, show: 17, name: 'Challenge: Pythagorean triples', parts: 4, how: 'Harder: bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 2418, show: 18, name: 'Challenge: Baseball', parts: 3, how: 'Harder: bigger diamonds. Optional extra practice.', state: 'ready' },
]

export const NODES35: (Node & { show: number })[] = [
  { no: 2103, show: 3, name: 'Compare', parts: 8, how: 'Write both as decimals, then compare digit by digit.', state: 'ready' },
  { no: 2104, show: 4, name: 'A number between', parts: 4, how: 'Same denominator, then a numerator in between.', state: 'ready' },
  { no: 2105, show: 5, name: 'Number lines', parts: 5, how: 'Start at the first number, then move by the second.', state: 'ready' },
  { no: 2106, show: 6, name: 'Add and subtract decimals', parts: 10, how: 'Line up the decimal points; watch the signs.', state: 'ready' },
  { no: 2109, show: 9, name: 'Multiply', parts: 6, how: 'Cancel common factors, then multiply.', state: 'ready' },
  { no: 2110, show: 10, name: 'Divide', parts: 6, how: 'Multiply by the reciprocal, cancel, then multiply.', state: 'ready' },
  { no: 2111, show: 11, name: 'Mixed numbers', parts: 6, how: 'Write the mixed numbers as fractions, multiply or divide, then write the answer as a mixed number.', state: 'ready' },
]

export const NODES34: (Node & { show: number })[] = [
  { no: 1901, show: 1, name: 'Multiply', parts: 10, how: 'The sign, multiply the numerators and the denominators, reduce.', state: 'ready' },
  { no: 1902, show: 2, name: 'Multiply by simplifying first', parts: 10, how: 'The sign, cancel common factors, then multiply.', state: 'ready' },
  { no: 1903, show: 3, name: 'Reciprocals', parts: 6, how: 'Write it as a fraction, then flip it.', state: 'ready' },
  { no: 1904, show: 4, name: 'Divide', parts: 8, how: 'Multiply by the reciprocal of the second number.', state: 'ready' },
  { no: 1905, show: 5, name: 'Divide and simplify', parts: 10, how: 'Multiply by the reciprocal, cancel common factors, then multiply.', state: 'ready' },
  { no: 1906, show: 6, name: 'Mixed numbers', parts: 14, how: 'Write the mixed numbers as fractions, multiply or divide, then write the answer as a mixed number.', state: 'ready' },
  { no: 1907, show: 7, name: 'Combined operations', parts: 10, how: 'Brackets, then exponents, then multiply and divide, then add and subtract.', state: 'ready' },
  { no: 1908, show: 8, name: 'Word problems', parts: 2, how: 'a = the recipe: half, then all the batches. b = the farm: the first share, then a fraction of it.', state: 'ready' },
  { no: 1909, show: 9, name: 'Challenge: Multiply', parts: 4, how: 'Harder: more numbers and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1910, show: 10, name: 'Challenge: Multiply by simplifying first', parts: 4, how: 'Harder: more numbers and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1911, show: 11, name: 'Challenge: Divide', parts: 4, how: 'Harder: more numbers and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1912, show: 12, name: 'Challenge: Divide and simplify', parts: 4, how: 'Harder: more numbers and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1913, show: 13, name: 'Challenge: Mixed numbers', parts: 4, how: 'Harder: more numbers and bigger numbers. Optional extra practice.', state: 'ready' },
]

export const NODES33: (Node & { show: number })[] = [
  { no: 1801, show: 1, name: 'Add fractions', parts: 12, how: 'Do each step and fill in the blank.', state: 'ready' },
  { no: 1802, show: 2, name: 'Mixed to improper', parts: 6, how: 'Do each step and fill in the blank.', state: 'ready' },
  { no: 1803, show: 3, name: 'Improper to mixed', parts: 6, how: 'Do each step and fill in the blank.', state: 'ready' },
  { no: 1804, show: 4, name: 'Add (improper form)', parts: 10, how: 'Do each step and fill in the blank.', state: 'ready' },
  { no: 1805, show: 5, name: 'Subtract', parts: 10, how: 'Do each step and fill in the blank.', state: 'ready' },
  { no: 1806, show: 6, name: 'Prime factors', parts: 10, how: 'Do each step and fill in the blank.', state: 'ready' },
  { no: 1807, show: 7, name: 'LCM', parts: 10, how: 'Do each step and fill in the blank.', state: 'ready' },
  { no: 1808, show: 8, name: 'Different denominators', parts: 10, how: 'Do each step and fill in the blank.', state: 'ready' },
  { no: 1809, show: 9, name: 'Add mixed numbers', parts: 10, how: 'Do each step and fill in the blank.', state: 'ready' },
  { no: 1810, show: 10, name: 'Subtract mixed numbers', parts: 10, how: 'Do each step and fill in the blank.', state: 'ready' },
  { no: 1811, show: 11, name: 'Fraction word problems', parts: 8, how: 'Add or subtract the fractions and mixed numbers one step at a time, then answer the question.', state: 'ready' },
  { no: 1812, show: 12, name: 'Challenge: Add fractions', parts: 4, how: 'Harder: more terms and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1813, show: 13, name: 'Challenge: Mixed to improper', parts: 4, how: 'Harder: more terms and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1814, show: 14, name: 'Challenge: Improper to mixed', parts: 4, how: 'Harder: more terms and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1815, show: 15, name: 'Challenge: Add (improper form)', parts: 4, how: 'Harder: more terms and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1816, show: 16, name: 'Challenge: Subtract', parts: 4, how: 'Harder: more terms and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1817, show: 17, name: 'Challenge: Prime factors', parts: 4, how: 'Harder: more terms and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1818, show: 18, name: 'Challenge: LCM', parts: 4, how: 'Harder: more terms and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1819, show: 19, name: 'Challenge: Different denominators', parts: 4, how: 'Harder: more terms and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1820, show: 20, name: 'Challenge: Add mixed numbers', parts: 4, how: 'Harder: more terms and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1821, show: 21, name: 'Challenge: Subtract mixed numbers', parts: 4, how: 'Harder: more terms and bigger numbers. Optional extra practice.', state: 'ready' },
  { no: 1822, show: 22, name: 'Challenge: Fraction word problems', parts: 4, how: 'Harder: more terms and bigger numbers. Optional extra practice.', state: 'ready' },
]

export const NODES32: (Node & { show: number })[] = [
  { no: 1701, show: 1, name: 'Add integers', parts: 10, how: 'Add two numbers at a time: same signs add, different signs subtract.', state: 'ready' },
  { no: 1702, show: 2, name: 'Equation of a number diagram', parts: 5, how: 'Read where the first arrow ends and how far the second one moves, then write the equation.', state: 'ready' },
  { no: 1703, show: 3, name: 'Addition on a number line', parts: 4, how: 'Where the first arrow ends, which way the second arrow moves, then the letter.', state: 'ready' },
  { no: 1704, show: 4, name: 'Subtract integers', parts: 10, how: 'Subtracting a negative number is adding; go from left to right.', state: 'ready' },
  { no: 1705, show: 5, name: 'Subtraction on a number line', parts: 4, how: 'Subtracting moves the arrow the opposite way, then the letter.', state: 'ready' },
  { no: 1706, show: 6, name: 'Add and subtract decimals', parts: 10, how: 'Same signs add, different signs subtract; line up the decimal points; then the sign.', state: 'ready' },
  { no: 1707, show: 7, name: 'Solve with a box', parts: 10, how: 'Undo the operation, then calculate.', state: 'ready' },
  { no: 1709, show: 9, name: 'Order decimals', parts: 2, how: 'Give every number the same number of decimal places, then order them.', state: 'ready' },
  { no: 1710, show: 10, name: 'Word problems with decimals', parts: 4, how: 'Add, subtract or multiply the decimals one step at a time, then answer the question.', state: 'ready' },
  { no: 1711, show: 11, name: 'Challenge: Add integers', parts: 4, how: 'Harder: more numbers and more decimal places. Optional extra practice.', state: 'ready' },
  { no: 1714, show: 14, name: 'Challenge: Subtract integers', parts: 4, how: 'Harder: more numbers and more decimal places. Optional extra practice.', state: 'ready' },
  { no: 1716, show: 16, name: 'Challenge: Add and subtract decimals', parts: 4, how: 'Harder: more numbers and more decimal places. Optional extra practice.', state: 'ready' },
  { no: 1717, show: 17, name: 'Challenge: Solve with a box', parts: 4, how: 'Harder: three decimal places. Optional extra practice.', state: 'ready' },
  { no: 1719, show: 19, name: 'Challenge: Order decimals', parts: 4, how: 'Harder: 8 numbers that are very close. Optional extra practice.', state: 'ready' },
  { no: 1720, show: 20, name: 'Challenge: Word problems with decimals', parts: 4, how: 'Harder: bigger numbers, a small difference. Optional extra practice.', state: 'ready' },
]

export const NODES31: (Node & { show: number })[] = [
  { no: 1602, show: 2, name: 'Graph rational numbers', parts: 5, how: 'Between which whole numbers, count the small steps, click the point.', state: 'ready' },
  { no: 1604, show: 4, name: 'Common denominator', parts: 10, how: 'The greatest common factor, then multiply and divide.', state: 'ready' },
  { no: 1605, show: 5, name: 'Order the numbers', parts: 4, how: 'Write them as decimals, then order them.', state: 'ready' },
  { no: 1606, show: 6, name: 'Compare', parts: 12, how: 'Write both as decimals, then compare digit by digit.', state: 'ready' },
  { no: 1607, show: 7, name: 'A fraction between', parts: 10, how: 'Write both fractions with the same denominator, then find a numerator between the two.', state: 'ready' },
  { no: 1608, show: 8, name: 'A fraction between', parts: 9, how: 'Write both decimals as fractions, then find a fraction between them.', state: 'ready' },
  { no: 1615, show: 15, name: 'Challenge: Order the numbers', parts: 4, how: 'Harder: 7 numbers. Optional extra practice.', state: 'ready' },
  { no: 1616, show: 16, name: 'Challenge: Compare', parts: 4, how: 'Harder: numbers that are very close. Optional extra practice.', state: 'ready' },
  { no: 1612, show: 12, name: 'Challenge: Graph rational numbers', parts: 4, how: 'Harder: 7 to 12 small steps per unit. Optional extra practice.', state: 'ready' },
  { no: 1614, show: 14, name: 'Challenge: Common denominator', parts: 4, how: 'Harder: bigger denominators. Optional extra practice.', state: 'ready' },
  { no: 1617, show: 17, name: 'Challenge: A fraction between', parts: 4, how: 'Harder: fractions that are almost equal. Optional extra practice.', state: 'ready' },
  { no: 1618, show: 18, name: 'Challenge: A fraction between', parts: 4, how: 'Harder: more decimal places, repeating decimals. Optional extra practice.', state: 'ready' },
]

export const NODES45: (Node & { show: number })[] = [
  { no: 1501, show: 1, name: 'Common difference', parts: 4, how: 'The second term minus the first term.', state: 'ready' },
  { no: 1502, show: 2, name: 'The 100th term', parts: 2, how: 'The common difference, 99 of them, the first term plus that.', state: 'ready' },
  { no: 1503, show: 3, name: 'Equation of the pattern', parts: 2, how: 'The common difference, the number added, the equation.', state: 'ready' },
  { no: 1506, show: 6, name: 'Complete the table', parts: 2, how: 'Put the given value in the equation.', state: 'ready' },
  { no: 1507, show: 7, name: 'Graph y = mx + b', parts: 2, how: 'The y-intercept, then use the slope to find the next point; click both.', state: 'ready' },
  { no: 1508, show: 8, name: 'Equation of a graph', parts: 4, how: 'b and m from the graph, then y = mx + b.', state: 'ready' },
  { no: 1509, show: 9, name: 'Lawn mower rental', parts: 3, how: 'Graph C = F + rd, the cost of some days, the days for a value.', state: 'ready' },
  { no: 1510, show: 10, name: 'Graph with fractions', parts: 2, how: 'Isolate y, find two points, click them.', state: 'ready' },
  { no: 1511, show: 11, name: 'Match equations and graphs', parts: 9, how: 'b and m, then click the matching graph.', state: 'ready' },
]

export const NODES44: (Node & { show: number })[] = [
  { no: 1401, show: 1, name: 'The y-intercept', parts: 5, how: 'Read where the line crosses the y-axis (a vertical line has none).', state: 'ready' },
  { no: 1402, show: 2, name: 'The slope', parts: 6, how: 'Rise, run, rise over run (a vertical line is undefined).', state: 'ready' },
  { no: 1403, show: 3, name: 'Equation of a line', parts: 6, how: 'b and m from the graph, then y = mx + b.', state: 'ready' },
  { no: 1404, show: 4, name: 'Which graph?', parts: 7, how: 'Isolate y, find m and b, then click the matching graph.', state: 'ready' },
  { no: 1405, show: 5, name: 'Which equation?', parts: 6, how: 'b and m from the graph, then the equation.', state: 'ready' },
  { no: 1406, show: 6, name: 'Word problems', parts: 4, how: 'Salary, tournament, telephone and temperature scales: the equation.', state: 'ready' },
]

export const NODES43: (Node & { show: number })[] = [
  { no: 1301, show: 1, name: 'Is it a solution?', parts: 6, how: 'Which number is x and y, work out the side, compare.', state: 'ready' },
  { no: 1302, show: 2, name: 'Graph the equation', parts: 10, how: 'Find two points, click them on the grid, press Submit.', state: 'ready' },
  { no: 1303, show: 3, name: 'Graph x = k and y = k', parts: 7, how: 'Every point has the same x (or y): click two of them.', state: 'ready' },
  { no: 1304, show: 4, name: 'Complete the table from the graph', parts: 4, how: 'Read the graph and type the missing numbers.', state: 'ready' },
  { no: 1305, show: 5, name: 'Draw a parallel line', parts: 4, how: 'The same slope, find b from the point, click two points.', state: 'ready' },
  { no: 1311, show: 11, name: 'Challenge: Is it a solution?', parts: 4, how: 'Harder: bigger and fractional coefficients. Optional extra practice.', state: 'ready' },
]

export const NODES42: (Node & { show: number })[] = [
  { no: 1204, show: 4, name: 'Locate a point', parts: 8, how: 'Go along the x-axis, then along the y-axis.', state: 'ready' },
  { no: 1205, show: 5, name: 'Coordinates of a point', parts: 6, how: 'Read x, read y, write (x, y).', state: 'ready' },
  { no: 1206, show: 6, name: 'Is it a solution?', parts: 6, how: 'Put the numbers in, then compare.', state: 'ready' },
  { no: 1216, show: 16, name: 'Challenge: Is it a solution?', parts: 4, how: 'Harder: bigger slopes and fractional slopes. Optional extra practice.', state: 'ready' },
  { no: 1207, show: 7, name: 'Complete the table', parts: 6, how: 'Put the given value in the equation.', state: 'ready' },
  { no: 1208, show: 8, name: 'The y-intercept', parts: 8, how: 'Put x = 0.', state: 'ready' },
  { no: 1218, show: 18, name: 'Challenge: The y-intercept', parts: 3, how: 'Harder: bigger intercepts and slopes. Optional extra practice.', state: 'ready' },
  { no: 1209, show: 9, name: 'Equation from a graph', parts: 8, how: 'The y-intercept, the slope, the equation.', state: 'ready' },
  { no: 1210, show: 10, name: 'Word problems', parts: 8, how: 'Stereo, soft drinks, spa, temperature: a = the values, b = click two points on the grid and Submit.', state: 'ready' },
]

export const NODES14: (Node & { show: number })[] = [
  { no: 2503, show: 3, name: 'Sign of a power', parts: 5, how: 'Is the base negative? Even or odd exponent?', state: 'ready' },
  { no: 2504, show: 4, name: 'Order the powers', parts: 2, how: 'Simplify each term, then order them.', state: 'ready' },
  { no: 2508, show: 8, name: 'Evaluate powers', parts: 5, how: 'Power first, then the minus sign in front.', state: 'ready' },
  { no: 2509, show: 9, name: 'The zero exponent', parts: 6, how: 'Any number except 0 to the power 0 is 1.', state: 'ready' },
  { no: 2510, show: 10, name: 'Repeated factor', parts: 6, how: 'The base, written as many times as the exponent.', state: 'ready' },
  { no: 2511, show: 11, name: 'Compare powers', parts: 6, how: 'Work out both sides, then compare.', state: 'ready' },
  { no: 2523, show: 23, name: 'Challenge: Sign of a power', parts: 4, how: 'Is the base negative? Even or odd exponent?', state: 'ready' },
  { no: 2524, show: 24, name: 'Challenge: Order the powers', parts: 2, how: 'Simplify each term, then order them.', state: 'ready' },
  { no: 2528, show: 28, name: 'Challenge: Evaluate powers', parts: 4, how: 'Power first, then the minus sign in front.', state: 'ready' },
  { no: 2529, show: 29, name: 'Challenge: The zero exponent', parts: 4, how: 'Any number except 0 to the power 0 is 1.', state: 'ready' },
  { no: 2530, show: 30, name: 'Challenge: Repeated factor', parts: 4, how: 'The base, written as many times as the exponent.', state: 'ready' },
  { no: 2531, show: 31, name: 'Challenge: Compare powers', parts: 4, how: 'Work out both sides, then compare.', state: 'ready' },
]

export const NODES15: (Node & { show: number })[] = [
  { no: 2601, show: 1, name: 'Calculate', parts: 10, how: 'Multiply and divide first, then add and subtract.', state: 'ready' },
  { no: 2602, show: 2, name: 'Brackets and division', parts: 10, how: 'Brackets first, then left to right.', state: 'ready' },
  { no: 2603, show: 3, name: 'Powers and fractions', parts: 10, how: 'Powers first; top and bottom of a fraction first.', state: 'ready' },
  { no: 2604, show: 4, name: 'Nested brackets', parts: 6, how: 'Innermost brackets first.', state: 'ready' },
  { no: 2621, show: 21, name: 'Challenge: Calculate', parts: 4, how: 'Multiply and divide first, then add and subtract.', state: 'ready' },
  { no: 2622, show: 22, name: 'Challenge: Brackets and division', parts: 4, how: 'Brackets first, then left to right.', state: 'ready' },
  { no: 2623, show: 23, name: 'Challenge: Powers and fractions', parts: 4, how: 'Powers first; top and bottom of a fraction first.', state: 'ready' },
  { no: 2624, show: 24, name: 'Challenge: Nested brackets', parts: 4, how: 'Innermost brackets first.', state: 'ready' },
]

export const NODES16: (Node & { show: number })[] = [
  { no: 2703, show: 3, name: 'Which equals 1', parts: 1, how: 'A power with exponent 0 is 1.', state: 'ready' },
  { no: 2704, show: 4, name: 'Zero exponents', parts: 9, how: 'Anything except 0 to the power 0 is 1.', state: 'ready' },
  { no: 2705, show: 5, name: 'Multiply powers', parts: 5, how: 'Same base: add the exponents.', state: 'ready' },
  { no: 2706, show: 6, name: 'Divide powers', parts: 4, how: 'Same base: subtract the exponents.', state: 'ready' },
  { no: 2707, show: 7, name: 'Multiply and divide', parts: 5, how: 'Add the top, subtract the bottom.', state: 'ready' },
  { no: 2708, show: 8, name: 'Simplify and evaluate', parts: 6, how: 'Simplify with the rules, then work out the value.', state: 'ready' },
  { no: 2709, show: 9, name: 'Variable exponents', parts: 4, how: 'Add and subtract the exponents with x.', state: 'ready' },
  { no: 2723, show: 23, name: 'Challenge: Which equals 1', parts: 4, how: 'A power with exponent 0 is 1.', state: 'ready' },
  { no: 2724, show: 24, name: 'Challenge: Zero exponents', parts: 4, how: 'Anything except 0 to the power 0 is 1.', state: 'ready' },
  { no: 2725, show: 25, name: 'Challenge: Multiply powers', parts: 4, how: 'Same base: add the exponents.', state: 'ready' },
  { no: 2726, show: 26, name: 'Challenge: Divide powers', parts: 4, how: 'Same base: subtract the exponents.', state: 'ready' },
  { no: 2727, show: 27, name: 'Challenge: Multiply and divide', parts: 4, how: 'Add the top, subtract the bottom.', state: 'ready' },
  { no: 2728, show: 28, name: 'Challenge: Simplify and evaluate', parts: 4, how: 'Simplify with the rules, then work out the value.', state: 'ready' },
  { no: 2729, show: 29, name: 'Challenge: Variable exponents', parts: 4, how: 'Add and subtract the exponents with x.', state: 'ready' },
]

export const NODES17: (Node & { show: number })[] = [
  { no: 2803, show: 3, name: 'Power of a power', parts: 4, how: 'Multiply the exponents.', state: 'ready' },
  { no: 2804, show: 4, name: 'Power of a product', parts: 4, how: 'Every factor gets the exponent.', state: 'ready' },
  { no: 2805, show: 5, name: 'Positive or negative', parts: 1, how: 'Odd or even exponent, then the sign in front.', state: 'ready' },
  { no: 2806, show: 6, name: 'Evaluate', parts: 6, how: 'Brackets first, then the power.', state: 'ready' },
  { no: 2807, show: 7, name: 'Powers of 2', parts: 5, how: 'Write every number as a power of 2.', state: 'ready' },
  { no: 2808, show: 8, name: 'Simplify and evaluate', parts: 5, how: 'Simplify with the rules, then work out the value.', state: 'ready' },
  { no: 2809, show: 9, name: 'Estimate with 2^10', parts: 1, how: '2^10 is about 1000.', state: 'ready' },
  { no: 2810, show: 10, name: 'Variable exponent', parts: 2, how: 'Multiply every term of the exponent.', state: 'ready' },
  { no: 2811, show: 11, name: 'Solve for x', parts: 4, how: 'Same base: the exponents are equal.', state: 'ready' },
  { no: 2823, show: 23, name: 'Challenge: Power of a power', parts: 4, how: 'Multiply the exponents.', state: 'ready' },
  { no: 2824, show: 24, name: 'Challenge: Power of a product', parts: 4, how: 'Every factor gets the exponent.', state: 'ready' },
  { no: 2825, show: 25, name: 'Challenge: Positive or negative', parts: 4, how: 'Odd or even exponent, then the sign in front.', state: 'ready' },
  { no: 2826, show: 26, name: 'Challenge: Evaluate', parts: 4, how: 'Brackets first, then the power.', state: 'ready' },
  { no: 2827, show: 27, name: 'Challenge: Powers of 2', parts: 4, how: 'Write every number as a power of 2.', state: 'ready' },
  { no: 2828, show: 28, name: 'Challenge: Simplify and evaluate', parts: 4, how: 'Simplify with the rules, then work out the value.', state: 'ready' },
  { no: 2829, show: 29, name: 'Challenge: Estimate with 2^10', parts: 4, how: '2^10 is about 1000.', state: 'ready' },
  { no: 2830, show: 30, name: 'Challenge: Variable exponent', parts: 4, how: 'Multiply every term of the exponent.', state: 'ready' },
  { no: 2831, show: 31, name: 'Challenge: Solve for x', parts: 4, how: 'Same base: the exponents are equal.', state: 'ready' },
]

export const NODES18: (Node & { show: number })[] = [
  { no: 2902, show: 2, name: 'Irrational numbers', parts: 1, how: 'A number that is not a fraction of integers.', state: 'ready' },
  { no: 2903, show: 3, name: 'Simplify roots', parts: 4, how: 'Take each root, then add; or add under the root first.', state: 'ready' },
  { no: 2904, show: 4, name: 'Word problem: rectangle', parts: 1, how: 'The area gives a square; then take the root.', state: 'ready' },
  { no: 2905, show: 5, name: 'Word problem: triangle', parts: 1, how: 'The area gives a square; then take the root.', state: 'ready' },
  { no: 2906, show: 6, name: 'Between two integers', parts: 2, how: 'The perfect squares on each side, then their roots.', state: 'ready' },
  { no: 2907, show: 7, name: 'One decimal place', parts: 2, how: 'The integers around the root, then the tenth.', state: 'ready' },
  { no: 2910, show: 10, name: 'Order powers', parts: 2, how: 'Compare the signs, then the sizes.', state: 'ready' },
  { no: 2911, show: 11, name: 'Zero exponent', parts: 6, how: 'Anything except 0 to the power 0 is 1.', state: 'ready' },
  { no: 2912, show: 12, name: 'Compare powers', parts: 6, how: 'Work out both sides, then compare.', state: 'ready' },
  { no: 2913, show: 13, name: 'Order of operations', parts: 10, how: 'Brackets, powers, multiply and divide, then add and subtract.', state: 'ready' },
  { no: 2915, show: 15, name: 'Exponent rules', parts: 8, how: 'Add the exponents to multiply, subtract to divide.', state: 'ready' },
  { no: 2916, show: 16, name: 'Simplify and evaluate', parts: 6, how: 'Simplify with the rules, then work out the value.', state: 'ready' },
  { no: 2917, show: 17, name: 'Power of a power', parts: 4, how: 'Multiply the exponents.', state: 'ready' },
  { no: 2918, show: 18, name: 'Evaluate', parts: 5, how: 'Brackets first, then the power.', state: 'ready' },
]

// ---- challenge exercises sit behind the regular exercise of the same kind: a Regular / Challenge switch in the page header ----
// A challenge node is named "Challenge: <name>"; its regular exercise is the one in the same section with that name (or a name it starts with), else the one numbered 10 lower.
const challengePairs = (lists: { no: number; name: string }[][]): [number, number][] => {
  const out: [number, number][] = []
  for (const list of lists) {
    const regular = list.filter((n) => !n.name.startsWith('Challenge: '))
    for (const c of list.filter((n) => n.name.startsWith('Challenge: '))) {
      const name = c.name.slice(11)
      const base =
        regular.find((n) => n.name === name) ?? regular.find((n) => name.startsWith(n.name) && !out.some(([r]) => r === n.no)) ?? regular.find((n) => n.no === c.no - 10)
      if (base && !out.some(([r]) => r === base.no)) out.push([base.no, c.no])
    }
  }
  return out
}
const PAIRS = challengePairs([NODES, NODES52, NODES53, NODES54, NODES55, NODES61, NODES62, NODES63, NODES64, NODES65, NODES66, NODES41, NODES11, NODES12, NODES13, NODES14, NODES15, NODES16, NODES17, NODES35, NODES34, NODES33, NODES32, NODES31, NODES45, NODES44, NODES43, NODES42])
export const CHALLENGE_OF: Record<number, number> = Object.fromEntries(PAIRS) // regular exercise -> its challenge
export const REGULAR_OF: Record<number, number> = Object.fromEntries(PAIRS.map(([r, c]) => [c, r]))
