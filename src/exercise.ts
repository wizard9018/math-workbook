// Shared shape of one textbook exercise in the quiz demo: a list of questions (2a ... 2j, 3a ... 3j), each answered by choosing one button,
// each with a lesson (shown after a wrong answer) and three practice questions (a wrong practice answer opens its own lesson).
// Imported by: quiz.tsx, quiz-data.ts (exercise 2), degree-data.ts (exercise 3).
import type { Lesson } from './lessons'

// a plane the student draws a line y = m x + c on (graph-draw.tsx): the axes, the grid step (the points snap to it), the names of the axes
export interface Draw {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
  xs: number
  ys: number
  xlabel: string
  ylabel: string
  m: number
  c: number
  vx?: number // a vertical line x = vx instead of y = m x + c
  xl?: number // a label on every xl-th x line only (a half step: 2)
  tol?: number // how far (in y) a clicked point may be from the line and still count (a coarse grid: the lawn mower graph)
}
// a table the student fills in by typing (fill-table.tsx): rows of cells (TeX, or null = a box to fill), the numbers that go in the boxes (left to right, top to bottom)
export interface Fill {
  rows: { label: string; cells: (string | null)[] }[]
  answers: number[]
}
// numbers the student puts in order on a number line by dragging them (sort-line.tsx): the numbers (TeX) in the order they are shown, and their indices from smallest to largest
export interface Sort {
  items: string[]
  order: number[]
}
// a question whose answer is any number of the options (multi-pick.tsx): the student ticks the options, then Submit; `right` = the indices that must be ticked (none is allowed)
export interface Multi {
  options: string[] // TeX
  right: number[]
}
export interface Practice {
  multi?: Multi // the answer is the ticked options, then Submit; no list of choices: choices[0] is right, choices[1] wrong
  sort?: Sort // the answer is the order of the dragged numbers, then Submit; no list of choices: choices[0] is right, choices[1] wrong
  fill?: Fill // the answer is typed into the boxes of this table, then Submit; no list of choices: choices[0] is right, choices[1] wrong
  draw?: Draw // the answer is a line drawn on this plane (two clicks, then Submit); no list of choices: choices[0] is right, choices[1] wrong

  onFigure?: boolean // the question text is shown above the picture and the answer is a click on a part of the picture (data-choice="i" in the SVG); no list of choices
  showTex?: boolean // the question text is shown above the picture (the choices stay)
  figure?: string // the question is a picture (SVG as a string); `tex` is then only a label of the lengths
  tex: string
  choices: string[]
  correct: number
  why: string
  lesson: () => Lesson
}
export interface Question {
  ladder?: boolean // `practice` is ordered easy -> hard (see build's rank): the first question comes from the easy end, a redo takes the next harder one
  part: string // a ... j
  multi?: Multi // see Practice
  onFigure?: boolean // see Practice
  showTex?: boolean // see Practice
  draw?: Draw // see Practice
  fill?: Fill // see Practice
  sort?: Sort // see Practice
  figure?: string // the question is a picture (SVG as a string); `tex` is then only a label of the lengths
  tex: string
  choices: string[]
  correct: number
  why: string
  lesson: () => Lesson
  practice: Practice[]
}
export interface Exercise {
  sec?: string // the section it belongs to when it is not 5.1 (shown before "Exercise")
  no: number
  prompt: string // the question under the title
  mathChoices?: boolean // the choices are TeX
  questions: Question[]
}
