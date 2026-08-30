import fs from 'node:fs/promises'

import { SpreadsheetFile, Workbook } from '@oai/artifact-tool'

const outputDir = new URL('.', import.meta.url)
const lessons = JSON.parse(
  await fs.readFile(new URL('./lessons-data.json', import.meta.url), 'utf8'),
)

const exercises = lessons.flatMap((lesson) =>
  lesson.exercises.map((exercise) => ({
    lessonNumber: lesson.lessonNumber,
    lessonId: lesson.lessonId,
    lessonTitle: lesson.lessonTitle,
    ...exercise,
  })),
)
const variants = exercises.flatMap((exercise) =>
  exercise.acceptedVariants.map((variant, index) => ({
    ...exercise,
    variantNumber: index + 1,
    variant,
  })),
)

if (lessons.length !== 16 || exercises.length !== 960) {
  throw new Error(
    `Unexpected content size: ${lessons.length} lessons, ${exercises.length} exercises`,
  )
}

const workbook = Workbook.create()
const summary = workbook.worksheets.add('Сводка')
const sentences = workbook.worksheets.add('Предложения')
const allVariants = workbook.worksheets.add('Все варианты')

const colors = {
  ink: '#173F35',
  inkSoft: '#315B50',
  mint: '#DDEDE7',
  mintSoft: '#EFF7F4',
  line: '#CBDCD6',
  paper: '#FFFFFF',
  muted: '#667A73',
}

function styleTitle(sheet, range, title) {
  range.merge()
  range.values = [[title]]
  range.format = {
    fill: colors.ink,
    font: { bold: true, color: colors.paper, size: 18 },
    horizontalAlignment: 'left',
    verticalAlignment: 'center',
  }
  range.format.rowHeight = 34
}

function styleSubtitle(range, text) {
  range.merge()
  range.values = [[text]]
  range.format = {
    fill: colors.mintSoft,
    font: { color: colors.inkSoft, italic: true },
    verticalAlignment: 'center',
    wrapText: true,
    borders: {
      bottom: { style: 'thin', color: colors.line },
    },
  }
  range.format.rowHeight = 30
}

function styleHeader(range) {
  range.format = {
    fill: colors.mint,
    font: { bold: true, color: colors.ink },
    verticalAlignment: 'center',
    wrapText: true,
    borders: {
      bottom: { style: 'medium', color: colors.inkSoft },
    },
  }
  range.format.rowHeight = 28
}

function styleDataRange(range) {
  range.format = {
    font: { color: '#1F2A26', size: 10 },
    verticalAlignment: 'top',
    borders: {
      insideHorizontal: { style: 'thin', color: '#E4ECE9' },
    },
  }
}

summary.showGridLines = false
styleTitle(summary, summary.getRange('A1:F1'), 'Предложения курса · уроки 1–16')
styleSubtitle(
  summary.getRange('A2:F2'),
  'Подготовленные задания курса: основной финский ответ и все допустимые варианты. Динамически созданные в пользовательских повторениях варианты сюда не входят.',
)

for (const [labelRange, valueRange, label, formula] of [
  ['A4:B4', 'A5:B6', 'Уроков', '=COUNTA(A9:A24)'],
  ['C4:D4', 'C5:D6', 'Заданий', '=SUM(D9:D24)'],
  ['E4:F4', 'E5:F6', 'Допустимых вариантов', '=SUM(E9:E24)'],
]) {
  const labelCell = summary.getRange(labelRange)
  labelCell.merge()
  labelCell.values = [[label]]
  labelCell.format = {
    fill: colors.mint,
    font: { bold: true, color: colors.inkSoft },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    borders: { preset: 'outside', style: 'thin', color: colors.line },
  }

  const valueCell = summary.getRange(valueRange)
  valueCell.merge()
  valueCell.formulas = [[formula]]
  valueCell.format = {
    fill: colors.paper,
    font: { bold: true, color: colors.ink, size: 20 },
    horizontalAlignment: 'center',
    verticalAlignment: 'center',
    numberFormat: '#,##0',
    borders: { preset: 'outside', style: 'thin', color: colors.line },
  }
}

summary.getRange('A8:E8').values = [
  ['№ урока', 'ID урока', 'Название', 'Заданий', 'Допустимых вариантов'],
]
styleHeader(summary.getRange('A8:E8'))
summary.getRange('A9:C24').values = lessons.map((lesson) => [
  lesson.lessonNumber,
  lesson.lessonId,
  lesson.lessonTitle,
])
summary.getRange('D9:D24').formulas = lessons.map((lesson) => [
  `=COUNTIF('Предложения'!$A$5:$A$964,A${lesson.lessonNumber + 8})`,
])
summary.getRange('E9:E24').formulas = lessons.map((lesson) => [
  `=SUMIF('Предложения'!$A$5:$A$964,A${lesson.lessonNumber + 8},'Предложения'!$I$5:$I$964)`,
])
styleDataRange(summary.getRange('A9:E24'))
summary.getRange('A9:A24').format.horizontalAlignment = 'center'
summary.getRange('D9:E24').format.horizontalAlignment = 'right'
summary.getRange('A8:E24').format.autofitRows()
summary.getRange('A:A').format.columnWidth = 11
summary.getRange('B:B').format.columnWidth = 30
summary.getRange('C:C').format.columnWidth = 42
summary.getRange('D:E').format.columnWidth = 20
summary.freezePanes.freezeRows(8)
summary.tables.add('A8:E24', true, 'LessonSummaryTable').style =
  'TableStyleMedium2'

sentences.showGridLines = false
styleTitle(sentences, sentences.getRange('A1:I1'), 'Все задания уроков 1–16')
styleSubtitle(
  sentences.getRange('A2:I2'),
  'Одна строка — одно подготовленное задание. Столбец «Допустимые варианты» содержит все ответы, которые принимает проверка.',
)
sentences.getRange('A4:I4').values = [
  [
    '№ урока',
    'ID урока',
    'Название урока',
    'Порядок',
    'ID задания',
    'Русский prompt',
    'Основное финское предложение',
    'Допустимые финские варианты',
    'Вариантов',
  ],
]
styleHeader(sentences.getRange('A4:I4'))
sentences.getRange(`A5:I${exercises.length + 4}`).values = exercises.map(
  (exercise) => [
    exercise.lessonNumber,
    exercise.lessonId,
    exercise.lessonTitle,
    exercise.order,
    exercise.exerciseId,
    exercise.prompt,
    exercise.targetText,
    exercise.acceptedVariants.join('\n'),
    exercise.acceptedVariants.length,
  ],
)
const sentenceData = sentences.getRange(`A5:I${exercises.length + 4}`)
styleDataRange(sentenceData)
sentences.getRange(`A5:A${exercises.length + 4}`).format.horizontalAlignment =
  'center'
sentences.getRange(`D5:D${exercises.length + 4}`).format.horizontalAlignment =
  'center'
sentences.getRange(`I5:I${exercises.length + 4}`).format.horizontalAlignment =
  'right'
sentences.getRange(`F5:H${exercises.length + 4}`).format.wrapText = true
sentences.getRange(`A4:I${exercises.length + 4}`).format.autofitRows()
sentences.getRange('A:A').format.columnWidth = 10
sentences.getRange('B:B').format.columnWidth = 29
sentences.getRange('C:C').format.columnWidth = 34
sentences.getRange('D:D').format.columnWidth = 10
sentences.getRange('E:E').format.columnWidth = 39
sentences.getRange('F:F').format.columnWidth = 45
sentences.getRange('G:G').format.columnWidth = 45
sentences.getRange('H:H').format.columnWidth = 58
sentences.getRange('I:I').format.columnWidth = 11
sentences.freezePanes.freezeRows(4)
sentences.freezePanes.freezeColumns(1)
sentences.tables.add(
  `A4:I${exercises.length + 4}`,
  true,
  'PreparedSentencesTable',
).style = 'TableStyleMedium2'

allVariants.showGridLines = false
styleTitle(
  allVariants,
  allVariants.getRange('A1:H1'),
  'Все допустимые финские варианты',
)
styleSubtitle(
  allVariants.getRange('A2:H2'),
  'Каждый допустимый ответ вынесен в отдельную строку — удобно искать, фильтровать и передавать на языковую проверку.',
)
allVariants.getRange('A4:H4').values = [
  [
    '№ урока',
    'ID урока',
    'Название урока',
    'Порядок задания',
    'ID задания',
    '№ варианта',
    'Русский prompt',
    'Финский вариант',
  ],
]
styleHeader(allVariants.getRange('A4:H4'))
allVariants.getRange(`A5:H${variants.length + 4}`).values = variants.map(
  (item) => [
    item.lessonNumber,
    item.lessonId,
    item.lessonTitle,
    item.order,
    item.exerciseId,
    item.variantNumber,
    item.prompt,
    item.variant,
  ],
)
const variantsData = allVariants.getRange(`A5:H${variants.length + 4}`)
styleDataRange(variantsData)
allVariants.getRange(`A5:A${variants.length + 4}`).format.horizontalAlignment =
  'center'
allVariants.getRange(`D5:F${variants.length + 4}`).format.horizontalAlignment =
  'center'
allVariants.getRange(`G5:H${variants.length + 4}`).format.wrapText = true
allVariants.getRange(`A4:H${variants.length + 4}`).format.autofitRows()
allVariants.getRange('A:A').format.columnWidth = 10
allVariants.getRange('B:B').format.columnWidth = 29
allVariants.getRange('C:C').format.columnWidth = 34
allVariants.getRange('D:D').format.columnWidth = 16
allVariants.getRange('E:E').format.columnWidth = 39
allVariants.getRange('F:F').format.columnWidth = 12
allVariants.getRange('G:H').format.columnWidth = 48
allVariants.freezePanes.freezeRows(4)
allVariants.freezePanes.freezeColumns(1)
allVariants.tables.add(
  `A4:H${variants.length + 4}`,
  true,
  'AcceptedVariantsTable',
).style = 'TableStyleMedium2'

const summaryInspection = await workbook.inspect({
  kind: 'table',
  range: 'Сводка!A1:F24',
  include: 'values,formulas',
  tableMaxRows: 24,
  tableMaxCols: 6,
})
console.log(summaryInspection.ndjson)

const sentenceInspection = await workbook.inspect({
  kind: 'table',
  range: 'Предложения!A4:I10',
  include: 'values,formulas',
  tableMaxRows: 10,
  tableMaxCols: 9,
})
console.log(sentenceInspection.ndjson)

const errors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
  options: { useRegex: true, maxResults: 100 },
  summary: 'final formula error scan',
})
console.log(errors.ndjson)

for (const [sheetName, range, fileName] of [
  ['Сводка', 'A1:F24', 'preview-summary.png'],
  ['Предложения', 'A1:I18', 'preview-sentences.png'],
  ['Все варианты', 'A1:H18', 'preview-variants.png'],
]) {
  const preview = await workbook.render({
    sheetName,
    range,
    scale: 1,
    format: 'png',
  })
  await fs.writeFile(
    new URL(fileName, outputDir),
    new Uint8Array(await preview.arrayBuffer()),
  )
}

const output = await SpreadsheetFile.exportXlsx(workbook)
await output.save(
  new URL('./predlozheniya-uroki-1-16.xlsx', outputDir).pathname,
)
