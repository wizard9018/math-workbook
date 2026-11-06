// Lesson scripts for the step-by-step player (main.tsx). One lesson = one question of the textbook bank.
// The expression is cut into tokens; every step works on some of them (focus), turns them into a result token and asks two questions:
//  1) ask  - which part comes next / is the problem (the letters A-D are put on the tokens of the current line)
//  2) calc - what is the result (four choices that fill the blank of the next line)
// A wrong answer opens a pop-up with the reason, the review card of the lesson, and a sentence the student must type before trying again.
export interface Tok {
  id: string
  tex: string
  hl?: string // how the token is written while the first step is on (parts of it highlighted)
}
export interface Ask {
  q: string
  options: string[][] // each option = the token ids that get the letter ([] = a "None of them" chip at the end of the line)
  correct: number
  also?: number[] // other options that are also right
  rule: string // the row of the review card that decides this step
  wrong: string[] // why each option is not right ('' for the right one)
  spell: string[] // the sentence the student must type after choosing that option ('' for the right one)
}
export interface Calc {
  q: string
  options: string[] // LaTeX of the candidate results
  correct: number
  hints: string[] // why a wrong result is wrong ('' for the right one)
  spell: string // the sentence the student must type after a wrong result
  example?: string // a small worked example (TeX) shown under the hint in the wrong-answer pop-up
}
export interface Step {
  from?: 'exponent' | 'each' // arrows start at the exponents written inside the focus tokens, else at their variables (constants: the whole token); 'each' = one arrow from every focus token
  focus: string[] // token ids on the current line that this step works on
  result: Tok // what they become
  morph?: { groups: string[][]; from: Record<string, string> } // the new line first shows `groups` of result ids inside brackets that fade away, and the tokens in `from` with their old text before it changes to the new one
  arrows?: { from: string[]; to: string[] }[] // explicit arrows after the step: from tokens of the old line to tokens of the new line (instead of one arrow to `result`)
  results?: Tok[] // when the group turns into several tokens (brackets removed): these replace the focus; `result` is then the first of them (the arrow points at it)
  say: string // written at the left of the new line
  ask?: Ask // question 1 (a step with nothing to choose has none)
  calc: Calc // question 2
  second?: Calc // a second blank (two terms move at once): its own four options, answered independently of `calc`
  blanks?: { id: string; from: string; after?: string; hide?: string[]; calc: Calc }[] // after: TeX written right after the blank (the bracket that stays) // from: the token of the current line that sends an arrow to the blank // the new line has a blank for each of these result tokens, every blank with its own question and options (the line comes from `results`)
  landArrows?: { from: string[]; to: string[] }[] // a step with `blanks`: arrows from tokens of earlier lines to tokens of the new line (instead of one arrow to each blank)
  auto?: boolean // no question: the new line is just shown (after the sentence), then the next question starts
  lit?: string[] // only these tokens of the line are shown highlighted (default: all of `focus`)
  figArrows?: { from: string; pt: number; route?: 'left' | 'right' }[] // once the step is done: an arrow from a token of its new line up to the point number `pt` (data-pt="pt") of the figure
  lift?: number // the new line is pulled up this many px, so that it stands beside the line above instead of under it (with `indent`)
  indent?: number // the new line of this step starts this many px further right (a second quantity worked out under its own part of the line above)
  after?: string | Record<string, string> // the results go right after the token with this id (a term moved to the other side), or each result after its own token (id -> id), instead of the place of the first focus token
  replace?: Tok // the first focus token is replaced by this one (not removed)
  split?: Step[] // after a wrong answer to this step the player replaces it by these smaller steps (same line before and after)
  calcPrompt?: string // shown at the top while question 2 is open (arithmetic leaves it out: the arrow already says what to calculate)
}
export interface ReviewRow {
  rule: string
  letters: string
  name: string
  note: string
}
// A vertical calculation (vertical.tsx): the polynomials are written one under the other, like terms in the same column, and the answer is built column by column.
export interface VCol {
  cells: string[] // TeX of each row's term in this column ('' = nothing there), as the rows are first written
  after: string[] // the same after the signs of the last row changed (subtraction); equal to cells for addition
  total: string // the term of the answer in this column, with the sign it has in the answer row
  question?: { prompt: string; options: string[]; correct: number; hint: string; example?: string } // absent: a column with a single term just comes down
}
export interface VSpec {
  raw: string // TeX of the question as written: the polynomials one under the other, NOT lined up in columns
  align?: { prompt: string; options: string[]; correct: number; hint: string; example?: string } // the first step: choose the layout with the like terms in the same column
  rows: number
  op: '+' | '-' // the sign written at the left of the lower rows
  cols: VCol[]
  flip?: { prompt: string; options: string[]; correct: number; hint: string; example: string } // subtraction: change the signs of the lower row first
}
export interface Lesson {
  vertical?: VSpec // set: the lesson is shown by VerticalLesson (start / steps are then empty)
  figure?: string // a picture (SVG as a string) shown above the working: the figure of a perimeter / surface area question
  figureAt?: (step: number) => string // the same picture while step number `step` is being asked (the side or face that step is about is lit up)
  reference?: { label: string; tex?: string; cells?: string[] }[] // a "look at these examples" panel shown above the working
  key: string
  label: string
  source: string // where the question comes from
  title: string
  prompt: string // the word in front of the first line
  answer: string // shown when the last line is reached
  start: Tok[]
  steps: Step[]
  review: { heading: string; rows: ReviewRow[] }
}

const T = (id: string, tex: string): Tok => ({ id, tex })
// (5+7) x 3 - 4^2 / 2
const ARITH_START: Tok[] = [T('a', '('), T('b', '5'), T('c', '+'), T('d', '7'), T('e', ')'), T('f', '\\times'), T('g', '3'), T('h', '-'), T('i', '4^2'), T('j', '\\div'), T('k', '2')]
const ARITH_STEPS: Step[] = [
  {
    focus: ['a', 'b', 'c', 'd', 'e'],
    result: T('r1', '12'),
    say: 'Brackets first: 5 plus 7 is 12.',
    ask: {
      q: 'Which operation should we do first?',
      options: [['c'], ['f'], ['h'], ['j']],
      correct: 0,
      rule: 'B',
      wrong: ['', 'Multiplication comes after anything inside brackets.', 'Subtraction is the very last kind of operation.', 'Division comes after brackets and exponents.'],
      spell: ['', 'brackets come before multiplication', 'brackets come before subtraction', 'brackets come before division'],
    },
    calc: { q: 'What is 5 + 7?', options: ['12', '2', '35', '57'], correct: 0, hints: ['', 'We are adding, not subtracting.', 'That is 5 × 7. Here we add.', 'Adding does not put the digits side by side.'], spell: '5 plus 7 is 12' },
  },
  {
    focus: ['i'],
    result: T('r2', '16'),
    say: 'Next the exponent: 4 squared is 16.',
    ask: {
      q: 'Which operation comes next?',
      options: [['f'], ['h'], ['i'], ['j']],
      correct: 2,
      rule: 'E',
      wrong: ['Multiplication comes after exponents.', 'Subtraction comes last.', '', 'Division comes after exponents.'],
      spell: ['exponents come before multiplication', 'exponents come before subtraction', '', 'exponents come before division'],
    },
    calc: { q: 'What is 4²?', options: ['16', '8', '6', '42'], correct: 0, hints: ['', '4² means 4 × 4, not 4 × 2.', '4² means 4 × 4, not 4 + 2.', '4² is not "4 and 2" side by side. It is 4 × 4.'], spell: '4 squared is 16' },
  },
  {
    focus: ['r1', 'f', 'g'],
    result: T('r3', '36'),
    say: 'Now multiply, left to right: 12 times 3 is 36.',
    ask: {
      q: 'Which operation comes next?',
      options: [['f'], ['h'], ['j']],
      correct: 0,
      rule: 'DM',
      wrong: ['', 'Subtraction comes after multiplication and division.', 'Division and multiplication are done left to right, and the multiplication is further left.'],
      spell: ['', 'multiplication comes before subtraction', 'multiplication and division go left to right'],
    },
    calc: { q: 'What is 12 × 3?', options: ['36', '15', '123', '9'], correct: 0, hints: ['', 'That is 12 + 3. Here we multiply.', 'Multiplying does not put the digits side by side.', 'That is 12 − 3. Here we multiply.'], spell: '12 times 3 is 36' },
  },
  {
    focus: ['r2', 'j', 'k'],
    result: T('r4', '8'),
    say: 'Then divide: 16 divided by 2 is 8.',
    ask: {
      q: 'Which operation comes next?',
      options: [['h'], ['j']],
      correct: 1,
      rule: 'DM',
      wrong: ['Subtraction comes after division.', ''],
      spell: ['division comes before subtraction', ''],
    },
    calc: { q: 'What is 16 ÷ 2?', options: ['8', '32', '14', '18'], correct: 0, hints: ['', 'That is 16 × 2. Here we divide.', 'That is 16 − 2. Here we divide.', 'That is 16 + 2. Here we divide.'], spell: '16 divided by 2 is 8' },
  },
  {
    focus: ['r3', 'h', 'r4'],
    result: T('r5', '28'),
    say: 'Last, subtract: 36 minus 8 is 28.',
    calc: { q: 'What is 36 − 8?', options: ['28', '44', '27', '29'], correct: 0, hints: ['', 'That is 36 + 8. Here we subtract.', 'Count again: 36 − 8 is one more than 27.', 'Count again: 36 − 8 is one less than 29.'], spell: '36 minus 8 is 28' },
  },
]

const ARITH_REVIEW: ReviewRow[] = [
  { rule: 'B', letters: 'B', name: 'Brackets', note: 'Work inside brackets first.' },
  { rule: 'E', letters: 'E', name: 'Exponents', note: 'Then powers and roots.' },
  { rule: 'DM', letters: 'DM', name: 'Division and Multiplication', note: 'Same rank: go left to right.' },
  { rule: 'AS', letters: 'AS', name: 'Addition and Subtraction', note: 'Same rank: go left to right.' },
]


// ---------- Grade 9, 5.1 exercise 2: "Determine if the expression is a polynomial" ----------
const POLY_REVIEW: ReviewRow[] = [
  { rule: 'denominator', letters: 'D', name: 'No variable in a denominator', note: 'x on the bottom of a fraction is not allowed.' },
  { rule: 'exponent', letters: 'E', name: 'Whole-number exponents only', note: 'Exponents are 0, 1, 2, 3 ... (no negative or fractional powers).' },
  { rule: 'root', letters: 'R', name: 'No variable under a root', note: 'A root of x is the same as a fractional power.' },
  { rule: 'coef', letters: 'C', name: 'Any real coefficient is fine', note: 'Fractions and roots in the coefficient are allowed, like 1/2 or the square root of 3.' },
]
const RED = (t: string) => `\\textcolor{#dc2626}{\\text{${t}}}`
const GREENTXT = (t: string) => `\\textcolor{#16a34a}{\\text{${t}}}`

// same level as the textbook question (bank: 5.1 exercise 2b, level 1)
const POLY_NORMAL: Lesson = {
  key: 'poly-normal',
  label: 'Polynomial - same level: 3/a^2',
  source: 'Grade 9, 5.1 exercise 2 (similar question)',
  title: 'Is it a polynomial?',
  prompt: 'Decide:',
  answer: 'not a polynomial',
  start: [T('a', '\\frac{3}{a^2}')],
  review: { heading: 'Polynomial rules', rows: POLY_REVIEW },
  steps: [
    {
      focus: ['a'],
      result: T('r1', RED('variable in the denominator')),
      say: 'The variable a is in the denominator, so this expression breaks a polynomial rule.',
      calcPrompt: 'Which polynomial rule does it break?',
      calc: {
        q: 'Which polynomial rule does it break?',
        options: ['\\text{a negative coefficient}', '\\text{a positive exponent}', '\\text{a variable in the denominator}', '\\text{more than one term}'],
        correct: 2,
        hints: ['A negative coefficient is allowed in a polynomial.', 'A positive exponent is allowed. Look at where the variable sits.', '', 'A polynomial can have one term or many terms.'],
        spell: 'a variable in the denominator',
      },
    },
    {
      focus: ['r1'],
      result: T('r2', RED('No, not a polynomial')),
      say: 'One broken rule is enough: 3 over a squared is not a polynomial.',
      calcPrompt: 'So is it a polynomial?',
      calc: {
        q: 'So is it a polynomial?',
        options: ['\\text{Yes, it is}', '\\text{No, it is not}'],
        correct: 1,
        hints: ['One broken rule is enough to stop it being a polynomial.', ''],
        spell: 'one broken rule is enough',
      },
    },
  ],
}

// harder (bank: 5.1 exercise 2a, level 2)
const POLY_HARDER: Lesson = {
  key: 'poly-harder',
  label: 'Polynomial - harder: 5x^2 - 2 root x + 8',
  source: 'Grade 9, 5.1 exercise 2 (harder question)',
  title: 'Is it a polynomial?',
  prompt: 'Decide:',
  answer: 'not a polynomial',
  start: [T('a', '5x^2'), T('b', '-'), T('c', '2\\sqrt{x}'), T('d', '+'), T('e', '8')],
  review: { heading: 'Polynomial rules', rows: POLY_REVIEW },
  steps: [
    {
      focus: ['c'],
      result: T('r1', RED('under a root')),
      say: 'The term 2 root x has a variable under a root, so it breaks the rule.',
      ask: {
        q: 'Which term breaks a polynomial rule?',
        options: [['a'], ['c'], ['e']],
        correct: 1,
        rule: 'root',
        wrong: ['5x squared has a whole-number exponent, so it is allowed.', '', '8 is just a number, so it is allowed.'],
        spell: ['whole number exponents are allowed', '', 'a constant is allowed'],
      },
      calcPrompt: 'Which rule does it break?',
      calc: {
        q: 'Which rule does it break?',
        options: ['\\text{a negative exponent}', '\\text{a variable under a root}', '\\text{a variable in a denominator}', '\\text{a negative coefficient}'],
        correct: 1,
        hints: ['The exponent is not negative. Look at the root sign.', '', 'There is no fraction here. Look at the root sign.', 'A negative coefficient is allowed in a polynomial.'],
        spell: 'a variable under a root',
      },
    },
    {
      focus: ['a', 'b', 'r1', 'd', 'e'],
      result: T('r2', RED('No, not a polynomial')),
      say: 'One bad term is enough, so the whole expression is not a polynomial.',
      calcPrompt: 'So is the whole expression a polynomial?',
      calc: {
        q: 'So is the whole expression a polynomial?',
        options: ['\\text{Yes}', '\\text{No}'],
        correct: 1,
        hints: ['Three terms is fine, but one of them breaks the rule.', ''],
        spell: 'one bad term is enough',
      },
    },
  ],
}

// harder, and it IS a polynomial (bank: 5.1 exercise 2a, level 2)
const POLY_YES: Lesson = {
  key: 'poly-yes',
  label: 'Polynomial - harder, yes: root 3 x^2 - 5x + 7',
  source: 'Grade 9, 5.1 exercise 2 (harder question)',
  title: 'Is it a polynomial?',
  prompt: 'Decide:',
  answer: 'a polynomial',
  start: [T('a', '\\sqrt{3}x^2'), T('b', '-'), T('c', '5x'), T('d', '+'), T('e', '7')],
  review: { heading: 'Polynomial rules', rows: POLY_REVIEW },
  steps: [
    {
      focus: ['a', 'b', 'c', 'd', 'e'],
      result: T('r1', GREENTXT('Yes, a polynomial')),
      say: 'No term breaks a rule: the exponents 2, 1 and 0 are whole numbers, and the coefficients are real numbers.',
      ask: {
        q: 'Which term breaks a polynomial rule?',
        options: [['a'], ['c'], ['e'], []],
        correct: 3,
        rule: 'coef',
        wrong: [
          'The root is only in the coefficient. A coefficient can be any real number.',
          'The exponent of 5x is 1, a whole number, so it is allowed.',
          '7 is a constant (exponent 0), so it is allowed.',
          '',
        ],
        spell: ['a root in the coefficient is allowed', 'exponent one is a whole number', 'a constant has exponent zero', ''],
      },
      calcPrompt: 'So is the expression a polynomial?',
      calc: {
        q: 'So is the expression a polynomial?',
        options: ['\\text{No, it has a root}', '\\text{Yes, it is}', '\\text{No, it has three terms}', '\\text{No, the exponent is 2}'],
        correct: 1,
        hints: ['The root is in the coefficient, not on the variable.', '', 'A polynomial can have any number of terms.', 'Exponent 2 is a whole number, so it is allowed.'],
        spell: 'every exponent is a whole number',
      },
    },
  ],
}

const ARITH: Lesson = {
  key: 'arith',
  label: 'Order of operations',
  source: 'demo',
  title: 'Order of operations',
  prompt: 'Evaluate:',
  answer: '28',
  start: ARITH_START,
  steps: ARITH_STEPS,
  review: { heading: 'Remember BEDMAS', rows: ARITH_REVIEW },
}

export const LESSONS: Lesson[] = [ARITH, POLY_NORMAL, POLY_HARDER, POLY_YES]
