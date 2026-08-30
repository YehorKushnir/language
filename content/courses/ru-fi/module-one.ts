import {
  consonantGradationContent,
  consonantGradationExercises,
  consonantGradationGoldenExerciseIds,
  consonantGradationSkills,
  consonantGradationVocabulary,
} from './lessons/fi.consonant-gradation.js'
import {
  genitivePossessionContent,
  genitivePossessionExercises,
  genitivePossessionGoldenExerciseIds,
  genitivePossessionSkills,
  genitivePossessionVocabulary,
} from './lessons/fi.genitive.possession.js'
import {
  infinitiveChainsContent,
  infinitiveChainsExercises,
  infinitiveChainsGoldenExerciseIds,
  infinitiveChainsSkills,
  infinitiveChainsVocabulary,
} from './lessons/fi.infinitive.chains.js'
import {
  imperfectAffirmativeContent,
  imperfectAffirmativeExercises,
  imperfectAffirmativeGoldenExerciseIds,
  imperfectAffirmativeSkills,
  imperfectAffirmativeVocabulary,
} from './lessons/fi.imperfect.affirmative.js'
import {
  imperfectNegativeQuestionContent,
  imperfectNegativeQuestionExercises,
  imperfectNegativeQuestionGoldenExerciseIds,
  imperfectNegativeQuestionSkills,
  imperfectNegativeQuestionVocabulary,
} from './lessons/fi.imperfect.negative-question.js'
import {
  lessonContent as firstLessonContent,
  lessonExercises as firstLessonExercises,
  lessonIdentityTemplateDefinition,
  lessonVocabulary as firstLessonVocabulary,
  type LessonVocabularySeed,
  type PreparedExerciseSeed,
} from './lessons/fi.olla.basics.js'
import {
  internalCasesContent,
  internalCasesExercises,
  internalCasesGoldenExerciseIds,
  internalCasesSkills,
  internalCasesVocabulary,
} from './lessons/fi.local-cases.internal.js'
import {
  externalCasesContent,
  externalCasesExercises,
  externalCasesGoldenExerciseIds,
  externalCasesSkills,
  externalCasesVocabulary,
} from './lessons/fi.local-cases.external.js'
import {
  nounsGradationContent,
  nounsGradationExercises,
  nounsGradationGoldenExerciseIds,
  nounsGradationSkills,
  nounsGradationVocabulary,
} from './lessons/fi.nouns.gradation.js'
import {
  partitiveFormationContent,
  partitiveFormationExercises,
  partitiveFormationGoldenExerciseIds,
  partitiveFormationSkills,
  partitiveFormationVocabulary,
} from './lessons/fi.partitive.formation.js'
import {
  partitiveUsageContent,
  partitiveUsageExercises,
  partitiveUsageGoldenExerciseIds,
  partitiveUsageSkills,
  partitiveUsageVocabulary,
} from './lessons/fi.partitive.usage.js'
import {
  pluralAgreementContent,
  pluralAgreementExercises,
  pluralAgreementGoldenExerciseIds,
  pluralAgreementSkills,
  pluralAgreementVocabulary,
} from './lessons/fi.plural.agreement.js'
import {
  presentCommonContent,
  presentCommonExercises,
  presentCommonGoldenExerciseIds,
  presentCommonVocabulary,
} from './lessons/fi.present.common.js'
import {
  PRESENT_NEGATIVE_SKILL_ID,
  PRESENT_QUESTION_SKILL_ID,
  questionsWordOrderContent,
  questionsWordOrderExercises,
  questionsWordOrderGoldenExerciseIds,
  questionsWordOrderVocabulary,
} from './lessons/fi.questions.word-order.js'
import {
  VERB_TYPE_THREE_SKILL_ID,
  VERB_TYPE_TWO_SKILL_ID,
  verbTypesTwoThreeContent,
  verbTypesTwoThreeExercises,
  verbTypesTwoThreeGoldenExerciseIds,
  verbTypesTwoThreeVocabulary,
} from './lessons/fi.verb-types.two-three.js'
import {
  VERB_TYPE_FIVE_SKILL_ID,
  VERB_TYPE_FOUR_SKILL_ID,
  VERB_TYPE_SIX_SKILL_ID,
  verbTypesFourSixContent,
  verbTypesFourSixExercises,
  verbTypesFourSixGoldenExerciseIds,
  verbTypesFourSixVocabulary,
} from './lessons/fi.verb-types.four-six.js'
import { withFinnishParadigm } from './finnish-paradigms.js'
import { applyReviewedExercises } from './reviewed-exercises.js'

type PartOfSpeech = LessonVocabularySeed['partOfSpeech']

export interface CourseExplanationScreenSeed {
  id: string
  title: { ru: string }
  paragraphs: readonly { ru: string }[]
  examples: readonly {
    target: string
    source: { ru: string }
  }[]
  table?: {
    headers: readonly { ru: string }[]
    rows: readonly (readonly { ru: string }[])[]
  }
  callout?: { ru: string }
}

export interface CourseLessonContentSeed {
  version: number
  sections: readonly ('explanation' | 'vocabulary' | 'practice')[]
  explanationScreens: readonly CourseExplanationScreenSeed[]
}

export interface CourseSkillSeed {
  id: string
  kind: 'GRAMMAR' | 'SPECIFIC_SKILL' | 'REGISTER'
  name: { ru: string }
  description: { ru: string }
  prerequisiteSkillIds: string[]
  role?: 'INTRODUCED' | 'PRACTICED' | 'RECOGNITION'
}

export interface CourseLessonSeed {
  id: string
  modulePosition: number
  lessonPosition: number
  title: { ru: string }
  summary: { ru: string }
  content: CourseLessonContentSeed
  vocabulary: LessonVocabularySeed[]
  exercises: PreparedExerciseSeed[]
  skills: CourseSkillSeed[]
  mvpQuality: {
    content: 'CURATED' | 'SCAFFOLD'
    linguisticReview: 'PASSED' | 'PENDING'
    goldenExerciseIds: readonly string[]
  }
  template?:
    | typeof lessonIdentityTemplateDefinition
    | CoursePreparedVariationTemplateSeed
  templateId?: string
}

export interface CoursePreparedVariationTemplateSeed {
  schemaVersion: 1
  frame: 'prepared-variation'
  lessonId: string
  sourceLanguage: 'ru'
  targetLanguage: 'fi'
  exerciseIds: string[]
  supportedItemIds: string[]
}

interface LessonSpecification {
  id: string
  title: string
  summary: string
  skillId: string
  skillName: string
  skillDescription: string
  focus: [string, string, string, string]
  vocabulary: string
}

const specifications: LessonSpecification[] = [
  {
    id: 'fi.present.common',
    title: 'Настоящее время: базовые глаголы',
    summary: 'Личные окончания и самые частые действия в настоящем времени.',
    skillId: 'grammar.fi.present.common',
    skillName: 'Настоящее время частых глаголов',
    skillDescription: 'Личные формы глагола и согласование с подлежащим.',
    focus: [
      'Личная форма показывает, кто выполняет действие, поэтому местоимение часто можно опустить.',
      'В словарной форме финский глагол оканчивается на -a/-ä, -da/-dä, -la/-lä, -na/-nä, -ra/-rä, -sta/-stä или -ta/-tä.',
      'Сначала находи основу, затем добавляй личное окончание. Форму третьего лица лучше запоминать вместе с глаголом.',
      'Отрабатывай глагол как часть короткой фразы, а не как изолированный перевод.',
    ],
    vocabulary: `
puhua|говорить|verb
asua|жить|verb
kysyä|спрашивать|verb
vastata|отвечать|verb
sanoa|сказать|verb
kertoa|рассказывать|verb
lukea|читать|verb
kirjoittaa|писать|verb
katsoa|смотреть|verb
kuunnella|слушать|verb
oppia|учиться|verb
opettaa|обучать|verb
ymmärtää|понимать|verb
muistaa|помнить|verb
unohtaa|забывать|verb
auttaa|помогать|verb
odottaa|ждать|verb
ottaa|брать|verb
antaa|давать|verb
löytää|находить|verb
käyttää|использовать|verb
maksaa|платить|verb
ostaa|покупать|verb
myydä|продавать|verb
avata|открывать|verb
sulkea|закрывать|verb`,
  },
  {
    id: 'fi.questions.word-order',
    title: 'Отрицание, вопросы и порядок слов',
    summary:
      'Вопросительная частица, отрицательный глагол и ясный порядок слов.',
    skillId: 'grammar.fi.questions.word-order',
    skillName: 'Отрицание и вопросительный порядок слов',
    skillDescription: 'Построение вопросов и отрицаний в настоящем времени.',
    focus: [
      'Общий вопрос начинается со сказуемого с частицей -ko/-kö, а вопросительное слово занимает первое место.',
      'В отрицании личное окончание переносится на глагол ei, а смысловой глагол остаётся в отрицательной основе.',
      'Нейтральный порядок — подлежащее, сказуемое, дополнение. Перенос элемента в начало выделяет его как тему.',
      'Интонация помогает, но грамматическую форму вопроса нужно показать и на письме.',
    ],
    vocabulary: `
kysymys|вопрос|noun
vastaus|ответ|noun
nimi|имя|noun
osoite|адрес|noun
numero|номер|noun
kieli|язык|noun
sana|слово|noun
lause|предложение|noun
ääni|голос|noun
keskustelu|разговор|noun
viesti|сообщение|noun
kirje|письмо|noun
puhelin|телефон|noun
sähköposti|электронная почта|noun
asia|дело|noun
ongelma|проблема|noun
esimerkki|пример|noun
syy|причина|noun
tapa|способ|noun
mielipide|мнение|noun
ajatus|мысль|noun
tieto|информация|noun
uutinen|новость|noun
tarina|история|noun
merkitys|значение|noun
virhe|ошибка|noun`,
  },
  {
    id: 'fi.verb-types.two-three',
    title: 'Глаголы второго и третьего типов',
    summary: 'Основы на гласную и согласную: типы 2 и 3 без угадывания.',
    skillId: 'grammar.fi.verb-types.two-three',
    skillName: 'Глагольные типы 2 и 3',
    skillDescription: 'Образование основы и личных форм глаголов типов 2 и 3.',
    focus: [
      'У глаголов второго типа перед -da/-dä уже есть гласная основы: juoda → juon.',
      'У третьего типа окончания -la/-lä, -na/-nä, -ra/-rä и -sta/-stä заменяются на -e- перед личным окончанием.',
      'Не определяй тип по переводу: смотри только на финскую словарную форму.',
      'Особые частотные глаголы kannattaa запоминать целыми парами: tehdä → teen, nähdä → näen.',
    ],
    vocabulary: `
saada|получать|verb
syödä|есть|verb
juoda|пить|verb
uida|плавать|verb
tupakoida|курить|verb
imuroida|пылесосить|verb
pysäköidä|парковать|verb
viedä|относить|verb
tuoda|приносить|verb
myydä|продавать|verb
pestä|мыть|verb
nousta|вставать|verb
purra|кусать|verb
kuunnella|слушать|verb
mennä|идти|verb
tulla|приходить|verb
tehdä|делать|verb
nähdä|видеть|verb
käydä|посещать|verb
kuolla|умирать|verb
panna|класть|verb
juosta|бежать|verb
ajatella|думать|verb
opiskella|учиться|verb
harjoitella|тренироваться|verb
työskennellä|работать|verb`,
  },
  {
    id: 'fi.verb-types.four-six',
    title: 'Глаголы четвёртого, пятого и шестого типов',
    summary: 'Глаголы на -ta/-tä и изменения основы перед личным окончанием.',
    skillId: 'grammar.fi.verb-types.four-six',
    skillName: 'Глагольные типы 4–6',
    skillDescription: 'Формы глаголов типов 4, 5 и 6 в настоящем времени.',
    focus: [
      'В четвёртом типе -ta/-tä заменяется на -a/-ä: haluta → haluan.',
      'В пятом типе перед окончаниями появляется -itse-: tarvita → tarvitsen.',
      'В шестом типе -eta/-etä превращается в -ene-: vanheta → vanhenen.',
      'Чередование согласных применяется уже к полученной основе, поэтому порядок действий важен.',
    ],
    vocabulary: `
haluta|хотеть|verb
herätä|просыпаться|verb
tavata|встречать|verb
osata|уметь|verb
pelata|играть|verb
siivota|убирать|verb
lainata|одалживать|verb
tykätä|нравиться|verb
vihata|ненавидеть|verb
tarvita|нуждаться|verb
pakata|упаковывать|verb
korjata|чинить|verb
maalata|красить|verb
tilata|заказывать|verb
pudota|падать|verb
levätä|отдыхать|verb
häiritä|мешать|verb
luvata|обещать|verb
palata|возвращаться|verb
pelätä|бояться|verb
lämmetä|теплеть|verb
kylmetä|холодать|verb
vanheta|стареть|verb
valita|выбирать|verb
avata|открывать|verb
vastata|отвечать|verb`,
  },
  {
    id: 'fi.consonant-gradation',
    title: 'Чередование согласных',
    summary: 'Сильная и слабая ступень в частотных словах и формах.',
    skillId: 'grammar.fi.consonant-gradation',
    skillName: 'Чередование согласных',
    skillDescription: 'Выбор сильной и слабой ступени основы.',
    focus: [
      'Согласные k, p и t могут меняться при закрытии слога: kk → k, pp → p, tt → t.',
      'Есть и качественные пары: k исчезает, p → v, t → d. Их нужно связывать с конкретной основой.',
      'Чередование относится не только к глаголам: оно регулярно появляется и в падежных формах существительных.',
      'Запоминай слово вместе с одной формой слабой ступени — так модель становится предсказуемой.',
    ],
    vocabulary: `
kauppa|магазин|noun
matto|ковёр|noun
pankki|банк|noun
lippu|билет|noun
kukka|цветок|noun
kenkä|ботинок|noun
hammas|зуб|noun
käsi|рука|noun
jalka|нога|noun
poika|мальчик|noun
aika|время|noun
paikka|место|noun
kaupunki|город|noun
katu|улица|noun
silta|мост|noun
ranta|берег|noun
pöytä|стол|noun
hylly|полка|noun
tuoli|стул|noun
sänky|кровать|noun
laukku|сумка|noun
takki|куртка|noun
paita|рубашка|noun
katto|крыша|noun
lattia|пол|noun
seinä|стена|noun`,
  },
  {
    id: 'fi.infinitive.chains',
    title: 'A-инфинитив и цепочки глаголов',
    summary: 'Модальные глаголы и несколько действий в одном предложении.',
    skillId: 'grammar.fi.infinitive.chains',
    skillName: 'Цепочки с A-инфинитивом',
    skillDescription: 'Сочетание личного глагола со словарной формой действия.',
    focus: [
      'После haluta, voida, osata и многих других глаголов следующее действие стоит в A-инфинитиве.',
      'Личное окончание получает только первый глагол: haluan lukea, voimme lähteä.',
      'Отрицательный глагол тоже относится к первому элементу цепочки: en voi tulla.',
      'Длинную цепочку разбирай слева направо: модальность, основное действие, дополнения.',
    ],
    vocabulary: `
voida|мочь|verb
tietää|знать|verb
tuntea|знать человека|verb
yrittää|пытаться|verb
alkaa|начинать|verb
lopettaa|заканчивать|verb
jatkaa|продолжать|verb
ehtiä|успевать|verb
pitää|любить|verb
sopia|подходить|verb
päättää|решать|verb
toivoa|надеяться|verb
suunnitella|планировать|verb
matkustaa|путешествовать|verb
lentää|летать|verb
ajaa|водить|verb
pyöräillä|ездить на велосипеде|verb
tanssia|танцевать|verb
laulaa|петь|verb
piirtää|рисовать|verb
kokata|готовить|verb
leipoa|печь|verb
siirtyä|перемещаться|verb
muuttua|изменяться|verb
seurata|следовать|verb
onnistua|добиваться успеха|verb`,
  },
  {
    id: 'fi.genitive.possession',
    title: 'Генитив, принадлежность и minulla on',
    summary: 'Чей предмет, у кого что есть и как описывать дом и семью.',
    skillId: 'grammar.fi.genitive.possession',
    skillName: 'Генитив и конструкция minulla on',
    skillDescription: 'Выражение принадлежности и обладания.',
    focus: [
      'Генитив обычно оканчивается на -n и ставит владельца перед предметом: Annan kirja.',
      'Русскому «у меня есть» соответствует местная конструкция minulla on.',
      'В отрицании предмет часто переходит в партитив: minulla ei ole autoa.',
      'Притяжательные суффиксы существуют, но на первом этапе достаточно генитива и местоимения.',
    ],
    vocabulary: `
perhe|семья|noun
äiti|мать|noun
isä|отец|noun
veli|брат|noun
sisko|сестра|noun
lapsi|ребёнок|noun
vauva|младенец|noun
vanhempi|родитель|noun
isoäiti|бабушка|noun
isoisä|дедушка|noun
aviomies|муж|noun
vaimo|жена|noun
naapuri|сосед|noun
koti|дом|noun
asunto|квартира|noun
huone|комната|noun
keittiö|кухня|noun
makuuhuone|спальня|noun
kylpyhuone|ванная|noun
olohuone|гостиная|noun
parveke|балкон|noun
piha|двор|noun
avain|ключ|noun
ovi|дверь|noun
ikkuna|окно|noun
vuokra|аренда|noun`,
  },
  {
    id: 'fi.nouns.gradation',
    title: 'Существительные и чередование согласных',
    summary: 'Падежная основа предметов и изменения k, p, t.',
    skillId: 'grammar.fi.nouns.gradation',
    skillName: 'Основа существительного',
    skillDescription: 'Построение падежной основы и чередование в именах.',
    focus: [
      'Падежное окончание добавляется не всегда прямо к словарной форме: сначала нужна основа.',
      'Закрытый слог часто вызывает слабую ступень, поэтому matto → maton и pankki → pankissa.',
      'В заимствованиях и новых словах основа обычно прозрачнее, но её всё равно нужно проверять по форме.',
      'Группируй предметы по модели изменения, а не только по тематике.',
    ],
    vocabulary: `
kirja|книга|noun
vihko|тетрадь|noun
kynä|ручка|noun
paperi|бумага|noun
lamppu|лампа|noun
kello|часы|noun
kuva|картина|noun
peili|зеркало|noun
kaappi|шкаф|noun
laatikko|коробка|noun
pullo|бутылка|noun
lasi|стакан|noun
kuppi|чашка|noun
lautanen|тарелка|noun
lusikka|ложка|noun
haarukka|вилка|noun
veitsi|нож|noun
kattila|кастрюля|noun
pannu|сковорода|noun
pyyhe|полотенце|noun
saippua|мыло|noun
harja|щётка|noun
kone|машина|noun
tietokone|компьютер|noun
televisio|телевизор|noun
radio|радио|noun`,
  },
  {
    id: 'fi.partitive.formation',
    title: 'Образование партитива',
    summary: 'Окончания -a/-ä, -ta/-tä и основа частичного объекта.',
    skillId: 'grammar.fi.partitive.formation',
    skillName: 'Образование партитива',
    skillDescription: 'Выбор окончания и основы партитива единственного числа.',
    focus: [
      'Партитив показывает неопределённое количество, часть вещества или незавершённость.',
      'После одной гласной часто добавляется -a/-ä, после долгой гласной или согласной — -ta/-tä.',
      'Гармония гласных выбирает передний или задний вариант окончания.',
      'Форму еды и напитков полезно учить сразу в контексте haluan или juon.',
    ],
    vocabulary: `
leipä|хлеб|noun
maito|молоко|noun
vesi|вода|noun
kahvi|кофе|noun
tee|чай|noun
mehu|сок|noun
juusto|сыр|noun
voi|масло|noun
muna|яйцо|noun
kala|рыба|noun
liha|мясо|noun
kana|курица|noun
riisi|рис|noun
pasta|макароны|noun
peruna|картофель|noun
tomaatti|помидор|noun
kurkku|огурец|noun
porkkana|морковь|noun
sipuli|лук|noun
omena|яблоко|noun
banaani|банан|noun
appelsiini|апельсин|noun
mansikka|клубника|noun
keitto|суп|noun
salaatti|салат|noun
kakku|торт|noun`,
  },
  {
    id: 'fi.partitive.usage',
    title: 'Основные случаи партитива',
    summary: 'Количество, отрицание, процесс и глаголы управления.',
    skillId: 'grammar.fi.partitive.usage',
    skillName: 'Употребление партитива',
    skillDescription:
      'Партитив после количества, отрицания и процессных глаголов.',
    focus: [
      'После чисел больше одного существительное стоит в партитиве единственного числа.',
      'Отрицательное предложение обычно требует партитива объекта независимо от результата действия.',
      'Незавершённый процесс противопоставляется завершённому объекту: luen kirjaa.',
      'Некоторые глаголы, например rakastaa и odottaa, регулярно управляют партитивом.',
    ],
    vocabulary: `
musiikki|музыка|noun
elokuva|фильм|noun
teatteri|театр|noun
taide|искусство|noun
urheilu|спорт|noun
jalkapallo|футбол|noun
jääkiekko|хоккей|noun
tennis|теннис|noun
uinti|плавание|noun
hiihto|лыжи|noun
lukeminen|чтение|noun
kirjoittaminen|письмо|noun
valokuvaus|фотография|noun
peli|игра|noun
matka|поездка|noun
juhla|праздник|noun
ilo|радость|noun
suru|печаль|noun
pelko|страх|noun
rakkaus|любовь|noun
viha|ненависть|noun
rauha|покой|noun
kiire|спешка|noun
uni|сон|noun
lepo|отдых|noun
harrastus|увлечение|noun`,
  },
  {
    id: 'fi.local-cases.internal',
    title: 'Внутренние местные падежи',
    summary: 'Где внутри, куда внутрь и откуда изнутри.',
    skillId: 'grammar.fi.local-cases.internal',
    skillName: 'Внутренние местные падежи',
    skillDescription: 'Инессив, иллатив и элатив в описании места.',
    focus: [
      'Инессив -ssa/-ssä отвечает на missä: olen kirjastossa.',
      'Иллатив отвечает на mihin и имеет несколько моделей: taloon, huoneeseen, kaupunkiin.',
      'Элатив -sta/-stä отвечает на mistä: tulen koulusta.',
      'Выбирай падеж по отношению к месту, а не по русскому предлогу.',
    ],
    vocabulary: `
koulu|школа|noun
yliopisto|университет|noun
kirjasto|библиотека|noun
museo|музей|noun
ravintola|ресторан|noun
kahvila|кафе|noun
hotelli|отель|noun
sairaala|больница|noun
apteekki|аптека|noun
asema|станция|noun
lentokenttä|аэропорт|noun
satama|порт|noun
tehdas|фабрика|noun
toimisto|офис|noun
myymälä|торговая точка|noun
posti|почта|noun
poliisiasema|полицейский участок|noun
kirkko|церковь|noun
puisto|парк|noun
tori|площадь|noun
elokuvateatteri|кинотеатр|noun
kuntosali|тренажёрный зал|noun
uimahalli|бассейн|noun
päiväkoti|детский сад|noun
hissi|лифт|noun
kerros|этаж|noun`,
  },
  {
    id: 'fi.local-cases.external',
    title: 'Внешние местные падежи',
    summary: 'На поверхности, к человеку и от открытого места.',
    skillId: 'grammar.fi.local-cases.external',
    skillName: 'Внешние местные падежи',
    skillDescription: 'Адессив, аллатив и аблатив в пространстве и обладании.',
    focus: [
      'Адессив -lla/-llä отвечает на millä и также выражает владельца: minulla on.',
      'Аллатив -lle показывает движение к поверхности или человеку.',
      'Аблатив -lta/-ltä показывает движение от поверхности или человека.',
      'У городских мест выбор внутренней или внешней серии часто лексический, поэтому проверяй пример.',
    ],
    vocabulary: `
bussi|автобус|noun
juna|поезд|noun
raitiovaunu|трамвай|noun
metro|метро|noun
taksi|такси|noun
polkupyörä|велосипед|noun
auto|автомобиль|noun
tie|дорога|noun
risteys|перекрёсток|noun
liikennevalo|светофор|noun
pysäkki|остановка|noun
metsä|лес|noun
järvi|озеро|noun
meri|море|noun
joki|река|noun
vuori|гора|noun
saari|остров|noun
pelto|поле|noun
niitty|луг|noun
puu|дерево|noun
ruoho|трава|noun
lumi|снег|noun
sade|дождь|noun
tuuli|ветер|noun
aurinko|солнце|noun
pilvi|облако|noun`,
  },
  {
    id: 'fi.plural.agreement',
    title: 'T-множественное и согласование',
    summary: 'Множественное число подлежащего, сказуемого и определения.',
    skillId: 'grammar.fi.plural.agreement',
    skillName: 'T-множественное и согласование',
    skillDescription: 'Форма именительного множественного и согласование слов.',
    focus: [
      'Именительный множественного обычно образуется от слабой основы с -t.',
      'Прилагательное согласуется с существительным в числе и падеже.',
      'Сказуемое получает форму третьего лица множественного: kirjat ovat uusia.',
      'После числительного используется не t-множественное, а партитив единственного.',
    ],
    vocabulary: `
suuri|большой|adjective
pieni|маленький|adjective
pitkä|длинный|adjective
lyhyt|короткий|adjective
vanha|старый|adjective
nuori|молодой|adjective
uusi|новый|adjective
hyvä|хороший|adjective
huono|плохой|adjective
kaunis|красивый|adjective
ruma|некрасивый|adjective
helppo|лёгкий|adjective
vaikea|трудный|adjective
nopea|быстрый|adjective
hidas|медленный|adjective
lämmin|тёплый|adjective
kylmä|холодный|adjective
kuuma|горячий|adjective
makea|сладкий|adjective
suolainen|солёный|adjective
puhdas|чистый|adjective
likainen|грязный|adjective
kallis|дорогой|adjective
halpa|дешёвый|adjective
tärkeä|важный|adjective
vapaa|свободный|adjective`,
  },
  {
    id: 'fi.imperfect.affirmative',
    title: 'Утвердительный имперфект',
    summary: 'Прошедшее время, показатель -i- и изменения основы.',
    skillId: 'grammar.fi.imperfect.affirmative',
    skillName: 'Утвердительный имперфект',
    skillDescription: 'Формы утвердительного прошедшего времени.',
    focus: [
      'Имперфект описывает завершённые и фоновые события прошлого.',
      'Показатель -i- появляется перед личным окончанием и может менять гласную основы.',
      'Частотные формы olin, menin, tulin и tein лучше довести до автоматизма.',
      'Временные слова eilen и viime viikolla помогают сразу задать прошлую рамку.',
    ],
    vocabulary: `
matkalaukku|чемодан|noun
passi|паспорт|noun
varaus|бронирование|noun
matkalippu|проездной билет|noun
hotellihuone|номер в отеле|noun
kartta|карта|noun
matkaopas|путеводитель|noun
turisti|турист|noun
retki|экскурсия|noun
loma|отпуск|noun
lähtö|отправление|noun
saapuminen|прибытие|noun
lento|рейс|noun
matkatavara|багаж|noun
valokuva|фотография|noun
muisto|воспоминание|noun
tapahtuma|событие|noun
konsertti|концерт|noun
kokous|собрание|noun
kilpailu|соревнование|noun
kurssi|курс|noun
koe|экзамен|noun
tehtävä|задание|noun
tulos|результат|noun
palkinto|награда|noun
päivä|день|noun`,
  },
  {
    id: 'fi.imperfect.negative-question',
    title: 'Отрицание и вопросы в прошлом',
    summary: 'Отрицательное причастие, вопросы и связный рассказ о прошлом.',
    skillId: 'grammar.fi.imperfect.negative-question',
    skillName: 'Отрицание и вопросы в имперфекте',
    skillDescription:
      'Отрицательные и вопросительные формы прошедшего времени.',
    focus: [
      'В отрицательном имперфекте ei получает личную форму, а смысловой глагол — форму прошедшего причастия.',
      'Единственное число использует форму вроде en mennyt, множественное — emme menneet.',
      'Вопрос строится из прошедшей личной формы с -ko/-kö: menitkö, tuliko hän.',
      'В рассказе чередуй утверждение, отрицание и вопрос, сохраняя одну временную рамку.',
    ],
    vocabulary: `
lähteä|уходить|verb
jäädä|оставаться|verb
nukkua|спать|verb
istua|сидеть|verb
seisoa|стоять|verb
kävellä|ходить пешком|verb
soittaa|звонить|verb
lähettää|отправлять|verb
syntyä|рождаться|verb
kasvaa|расти|verb
tapahtua|случаться|verb
kadota|исчезать|verb
rikkoa|ломать|verb
voittaa|побеждать|verb
saapua|прибывать|verb
vapista|дрожать|verb
nauraa|смеяться|verb
itkeä|плакать|verb
hymyillä|улыбаться|verb
huutaa|кричать|verb
kuiskata|шептать|verb
kantaa|нести|verb
nostaa|поднимать|verb
laskea|считать|verb
pudottaa|ронять|verb
vaihtaa|менять|verb`,
  },
]

const firstLessonSkills: CourseSkillSeed[] = [
  {
    id: 'grammar.fi.olla.affirmative',
    kind: 'GRAMMAR',
    name: { ru: 'Утвердительные предложения с olla' },
    description: { ru: 'Личные формы olla в настоящем времени.' },
    prerequisiteSkillIds: [],
  },
  {
    id: 'grammar.fi.olla.negative',
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Отрицание с olla' },
    description: { ru: 'Согласование отрицательного глагола с лицом.' },
    prerequisiteSkillIds: ['grammar.fi.olla.affirmative'],
  },
  {
    id: 'grammar.fi.olla.question',
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Вопросы с olla' },
    description: { ru: 'Общие вопросы с частицей -ko/-kö.' },
    prerequisiteSkillIds: ['grammar.fi.olla.affirmative'],
  },
  {
    id: 'register.fi.puhekieli.olla',
    kind: 'REGISTER',
    name: { ru: 'Разговорные формы olla' },
    description: { ru: 'Распознавание распространённых форм puhekieli.' },
    prerequisiteSkillIds: ['grammar.fi.olla.affirmative'],
    role: 'RECOGNITION',
  },
]

const generatedLessons = specifications.map((specification, index) => {
  const lesson = createLesson(specification, index + 2)
  return {
    ...lesson,
    template: createPreparedVariationTemplate(lesson),
    templateId: `template.${lesson.id}.prepared-variation@1`,
  }
})

const moduleOneLessonsWithoutFullParadigms: CourseLessonSeed[] = [
  {
    id: 'fi.olla.basics',
    modulePosition: 1,
    lessonPosition: 1,
    title: { ru: 'Личные местоимения и olla' },
    summary: { ru: 'Утверждение, отрицание и общий вопрос.' },
    content: firstLessonContent,
    vocabulary: firstLessonVocabulary,
    exercises: firstLessonExercises,
    skills: firstLessonSkills,
    template: lessonIdentityTemplateDefinition,
    templateId: 'template.fi.olla.identity@1',
    mvpQuality: {
      content: 'CURATED',
      linguisticReview: 'PASSED',
      goldenExerciseIds: firstLessonExercises
        .slice(0, 6)
        .map((exercise) => exercise.id),
    },
  },
  ...generatedLessons,
]

const moduleOneLessonsWithFullParadigms =
  moduleOneLessonsWithoutFullParadigms.map((lesson) => ({
    ...lesson,
    vocabulary: lesson.vocabulary.map(withFinnishParadigm),
  }))

export const moduleOneLessons: CourseLessonSeed[] = applyReviewedExercises(
  moduleOneLessonsWithFullParadigms,
)

export const moduleOneVocabulary = moduleOneLessons.flatMap(
  (lesson) => lesson.vocabulary,
)

export const moduleOneVocabularyByLemma = new Map(
  moduleOneVocabulary.map((item) => [item.lemma, item]),
)

function createLesson(
  specification: LessonSpecification,
  lessonPosition: number,
): CourseLessonSeed {
  const vocabulary = parseVocabulary(specification.vocabulary, lessonPosition)
  const prerequisiteSkillId =
    lessonPosition === 2
      ? 'grammar.fi.olla.affirmative'
      : specifications[lessonPosition - 3]!.skillId
  const skill: CourseSkillSeed = {
    id: specification.skillId,
    kind: 'GRAMMAR',
    name: { ru: specification.skillName },
    description: { ru: specification.skillDescription },
    prerequisiteSkillIds: [prerequisiteSkillId],
  }

  const lesson: CourseLessonSeed = {
    id: specification.id,
    modulePosition: 1,
    lessonPosition,
    title: { ru: specification.title },
    summary: { ru: specification.summary },
    content: createLessonContent(specification, vocabulary),
    vocabulary,
    exercises: createExercises(specification, vocabulary),
    skills: [skill],
    mvpQuality: {
      content: 'SCAFFOLD',
      linguisticReview: 'PENDING',
      goldenExerciseIds: [],
    },
  }

  if (specification.id === 'fi.present.common') {
    return {
      ...lesson,
      title: { ru: 'Настоящее время: глаголы первого типа' },
      summary: {
        ru: 'Основа, личные окончания и чередование частых глаголов первого типа.',
      },
      content: presentCommonContent,
      vocabulary: presentCommonVocabulary,
      exercises: presentCommonExercises,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: presentCommonGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.questions.word-order') {
    return {
      ...lesson,
      content: questionsWordOrderContent,
      vocabulary: questionsWordOrderVocabulary,
      exercises: questionsWordOrderExercises,
      skills: [
        skill,
        {
          id: PRESENT_NEGATIVE_SKILL_ID,
          kind: 'SPECIFIC_SKILL',
          name: { ru: 'Отрицание в настоящем времени' },
          description: {
            ru: 'Личные формы отрицательного глагола и отрицательная форма смыслового глагола.',
          },
          prerequisiteSkillIds: ['grammar.fi.present.common'],
        },
        {
          id: PRESENT_QUESTION_SKILL_ID,
          kind: 'SPECIFIC_SKILL',
          name: { ru: 'Общие вопросы в настоящем времени' },
          description: {
            ru: 'Частица -ko/-kö и вопросительный порядок слов.',
          },
          prerequisiteSkillIds: ['grammar.fi.present.common'],
        },
      ],
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: questionsWordOrderGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.verb-types.two-three') {
    return {
      ...lesson,
      content: verbTypesTwoThreeContent,
      vocabulary: verbTypesTwoThreeVocabulary,
      exercises: verbTypesTwoThreeExercises,
      skills: [
        skill,
        {
          id: VERB_TYPE_TWO_SKILL_ID,
          kind: 'SPECIFIC_SKILL',
          name: { ru: 'Глаголы второго типа' },
          description: { ru: 'Основа после удаления -da/-dä.' },
          prerequisiteSkillIds: ['grammar.fi.present.common'],
        },
        {
          id: VERB_TYPE_THREE_SKILL_ID,
          kind: 'SPECIFIC_SKILL',
          name: { ru: 'Глаголы третьего типа' },
          description: {
            ru: 'Основа на -e- после замены окончания инфинитива.',
          },
          prerequisiteSkillIds: ['grammar.fi.present.common'],
        },
      ],
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: verbTypesTwoThreeGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.verb-types.four-six') {
    return {
      ...lesson,
      content: verbTypesFourSixContent,
      vocabulary: verbTypesFourSixVocabulary,
      exercises: verbTypesFourSixExercises,
      skills: [
        skill,
        {
          id: VERB_TYPE_FOUR_SKILL_ID,
          kind: 'SPECIFIC_SKILL',
          name: { ru: 'Глаголы четвёртого типа' },
          description: { ru: 'Основа на долгую гласную после удаления t.' },
          prerequisiteSkillIds: ['grammar.fi.present.common'],
        },
        {
          id: VERB_TYPE_FIVE_SKILL_ID,
          kind: 'SPECIFIC_SKILL',
          name: { ru: 'Глаголы пятого типа' },
          description: { ru: 'Основа на -itse-.' },
          prerequisiteSkillIds: ['grammar.fi.present.common'],
        },
        {
          id: VERB_TYPE_SIX_SKILL_ID,
          kind: 'SPECIFIC_SKILL',
          name: { ru: 'Глаголы шестого типа' },
          description: { ru: 'Основа на -ne- у глаголов изменения состояния.' },
          prerequisiteSkillIds: ['grammar.fi.present.common'],
        },
      ],
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: verbTypesFourSixGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.consonant-gradation') {
    return {
      ...lesson,
      title: { ru: 'Чередование согласных в глаголах' },
      summary: {
        ru: 'Сильная и слабая ступень k, p и t в уже знакомых глагольных типах.',
      },
      content: consonantGradationContent,
      vocabulary: consonantGradationVocabulary,
      exercises: consonantGradationExercises,
      skills: consonantGradationSkills,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: consonantGradationGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.infinitive.chains') {
    return {
      ...lesson,
      content: infinitiveChainsContent,
      vocabulary: infinitiveChainsVocabulary,
      exercises: infinitiveChainsExercises,
      skills: infinitiveChainsSkills,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: infinitiveChainsGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.genitive.possession') {
    return {
      ...lesson,
      content: genitivePossessionContent,
      vocabulary: genitivePossessionVocabulary,
      exercises: genitivePossessionExercises,
      skills: genitivePossessionSkills,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: genitivePossessionGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.nouns.gradation') {
    return {
      ...lesson,
      content: nounsGradationContent,
      vocabulary: nounsGradationVocabulary,
      exercises: nounsGradationExercises,
      skills: nounsGradationSkills,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: nounsGradationGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.partitive.formation') {
    return {
      ...lesson,
      content: partitiveFormationContent,
      vocabulary: partitiveFormationVocabulary,
      exercises: partitiveFormationExercises,
      skills: partitiveFormationSkills,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: partitiveFormationGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.partitive.usage') {
    return {
      ...lesson,
      content: partitiveUsageContent,
      vocabulary: partitiveUsageVocabulary,
      exercises: partitiveUsageExercises,
      skills: partitiveUsageSkills,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: partitiveUsageGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.local-cases.internal') {
    return {
      ...lesson,
      content: internalCasesContent,
      vocabulary: internalCasesVocabulary,
      exercises: internalCasesExercises,
      skills: internalCasesSkills,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: internalCasesGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.local-cases.external') {
    return {
      ...lesson,
      content: externalCasesContent,
      vocabulary: externalCasesVocabulary,
      exercises: externalCasesExercises,
      skills: externalCasesSkills,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: externalCasesGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.plural.agreement') {
    return {
      ...lesson,
      content: pluralAgreementContent,
      vocabulary: pluralAgreementVocabulary,
      exercises: pluralAgreementExercises,
      skills: pluralAgreementSkills,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: pluralAgreementGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.imperfect.affirmative') {
    return {
      ...lesson,
      content: imperfectAffirmativeContent,
      vocabulary: imperfectAffirmativeVocabulary,
      exercises: imperfectAffirmativeExercises,
      skills: imperfectAffirmativeSkills,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: imperfectAffirmativeGoldenExerciseIds,
      },
    }
  }

  if (specification.id === 'fi.imperfect.negative-question') {
    return {
      ...lesson,
      content: imperfectNegativeQuestionContent,
      vocabulary: imperfectNegativeQuestionVocabulary,
      exercises: imperfectNegativeQuestionExercises,
      skills: imperfectNegativeQuestionSkills,
      mvpQuality: {
        content: 'CURATED',
        linguisticReview: 'PASSED',
        goldenExerciseIds: imperfectNegativeQuestionGoldenExerciseIds,
      },
    }
  }

  return lesson
}

function createPreparedVariationTemplate(
  lesson: CourseLessonSeed,
): CoursePreparedVariationTemplateSeed {
  return {
    schemaVersion: 1,
    frame: 'prepared-variation',
    lessonId: lesson.id,
    sourceLanguage: 'ru',
    targetLanguage: 'fi',
    exerciseIds: lesson.exercises.map((exercise) => exercise.id),
    supportedItemIds: [
      ...lesson.skills.map((skill) => skill.id),
      ...lesson.vocabulary.map((item) => item.itemId),
    ],
  }
}

function parseVocabulary(
  source: string,
  lessonPosition: number,
): LessonVocabularySeed[] {
  return source
    .trim()
    .split('\n')
    .map((line, index) => {
      const [lemma, gloss, partOfSpeech] = line.split('|') as [
        string,
        string,
        PartOfSpeech,
      ]
      const serial = `${lessonPosition.toString().padStart(2, '0')}.${(
        index + 1
      )
        .toString()
        .padStart(2, '0')}`
      return {
        key: `m1-${serial.replace('.', '-')}`,
        itemId: `word.fi.m1.${serial}`,
        conceptId: `concept.fi.m1.${serial}`,
        lexicalEntryId: `lex.fi.${lemma}`,
        lemma,
        partOfSpeech,
        gloss,
        example:
          partOfSpeech === 'verb'
            ? {
                target: `Haluan ${lemma}.`,
                source: { ru: `Я хочу ${gloss}.` },
              }
            : partOfSpeech === 'adjective'
              ? {
                  target: `Se on ${lemma}.`,
                  source: { ru: `Это ${gloss}.` },
                }
              : {
                  target: `Tämä on ${lemma}.`,
                  source: { ru: `Это ${gloss}.` },
                },
        semanticTypes: ['module-one', partOfSpeech],
        singular: lemma,
        plural: lemma,
        sourceSingular: gloss,
        sourcePlural: gloss,
        forms: [
          {
            id: `form.fi.m1.${serial}.lemma`,
            surface: lemma,
            features: { form: 'lemma' },
          },
        ],
      }
    })
}

function createLessonContent(
  specification: LessonSpecification,
  vocabulary: LessonVocabularySeed[],
): CourseLessonContentSeed {
  return {
    version: 1,
    sections: ['explanation', 'vocabulary', 'practice'],
    explanationScreens: specification.focus.map((paragraph, screenIndex) => ({
      id: `rule-${screenIndex + 1}`,
      title: {
        ru: [
          'Основная модель',
          'Как строится форма',
          'Что важно заметить',
          'Как применять в речи',
        ][screenIndex]!,
      },
      paragraphs: [{ ru: paragraph }],
      examples: vocabulary
        .slice(screenIndex * 3, screenIndex * 3 + 3)
        .map((item) => {
          const context = createContext(item)
          return { target: context.targetText, source: { ru: context.prompt } }
        }),
      callout:
        screenIndex === 3
          ? { ru: 'Произнеси примеры вслух и затем собери их по памяти.' }
          : undefined,
    })),
  }
}

function createExercises(
  specification: LessonSpecification,
  vocabulary: LessonVocabularySeed[],
): PreparedExerciseSeed[] {
  const wordExercises = vocabulary.map((item, index) => ({
    id: `exercise.${specification.id}.word.${index + 1}`,
    selectionOrder: index + 1,
    prompt: item.gloss,
    targetText: item.lemma,
    acceptedVariants: [item.lemma],
    slots: [{ role: 'word', accepted: [item.lemma], itemIds: [item.itemId] }],
    primaryItemId: item.itemId,
    secondaryItemIds: [],
    vocabularyItemId: item.itemId,
  }))
  const contextExercises = vocabulary.map((item, index) => {
    const context = createContext(item)
    return {
      id: `exercise.${specification.id}.context.${index + 1}`,
      selectionOrder: vocabulary.length + index + 1,
      prompt: context.prompt,
      targetText: context.targetText,
      acceptedVariants: [context.targetText],
      slots: context.slots.map((slot) => ({
        ...slot,
        itemIds:
          slot.role === 'vocabulary' ? [item.itemId] : [specification.skillId],
      })),
      primaryItemId: specification.skillId,
      secondaryItemIds: [],
      vocabularyItemId: item.itemId,
    }
  })
  const pairExercises = Array.from({ length: 8 }, (_, index) => {
    const first = vocabulary[index * 2]!
    const second = vocabulary[index * 2 + 1]!
    const context = createPairContext(first, second)
    return {
      id: `exercise.${specification.id}.pair.${index + 1}`,
      selectionOrder: vocabulary.length * 2 + index + 1,
      prompt: context.prompt,
      targetText: context.targetText,
      acceptedVariants: [context.targetText],
      slots: context.slots.map((slot) => ({
        role: slot.role,
        accepted: slot.accepted,
        itemIds:
          slot.role === 'first'
            ? [first.itemId]
            : slot.role === 'second'
              ? [second.itemId]
              : [specification.skillId],
      })),
      primaryItemId: specification.skillId,
      secondaryItemIds: [first.itemId],
      vocabularyItemId: second.itemId,
    }
  })
  return [...wordExercises, ...contextExercises, ...pairExercises]
}

function createContext(item: LessonVocabularySeed) {
  if (item.partOfSpeech === 'verb') {
    return {
      prompt: `Я хочу ${item.gloss}.`,
      targetText: `Haluan ${item.lemma}.`,
      slots: [
        { role: 'frame', accepted: ['haluan'] },
        { role: 'vocabulary', accepted: [item.lemma] },
      ],
    }
  }
  if (item.partOfSpeech === 'adjective') {
    return {
      prompt: `Это ${item.gloss}.`,
      targetText: `Se on ${item.lemma}.`,
      slots: [
        { role: 'subject', accepted: ['se'] },
        { role: 'frame', accepted: ['on'] },
        { role: 'vocabulary', accepted: [item.lemma] },
      ],
    }
  }
  return {
    prompt: `Это ${item.gloss}.`,
    targetText: `Tämä on ${item.lemma}.`,
    slots: [
      { role: 'subject', accepted: ['tämä'] },
      { role: 'frame', accepted: ['on'] },
      { role: 'vocabulary', accepted: [item.lemma] },
    ],
  }
}

function createPairContext(
  first: LessonVocabularySeed,
  second: LessonVocabularySeed,
) {
  if (first.partOfSpeech === 'verb') {
    return {
      prompt: `Я хочу ${first.gloss} и ${second.gloss}.`,
      targetText: `Haluan ${first.lemma} ja ${second.lemma}.`,
      slots: [
        { role: 'frame', accepted: ['haluan'] },
        { role: 'first', accepted: [first.lemma] },
        { role: 'conjunction', accepted: ['ja'] },
        { role: 'second', accepted: [second.lemma] },
      ],
    }
  }
  if (first.partOfSpeech === 'adjective') {
    return {
      prompt: `Это ${first.gloss} и ${second.gloss}.`,
      targetText: `Se on ${first.lemma} ja ${second.lemma}.`,
      slots: [
        { role: 'subject', accepted: ['se'] },
        { role: 'frame', accepted: ['on'] },
        { role: 'first', accepted: [first.lemma] },
        { role: 'conjunction', accepted: ['ja'] },
        { role: 'second', accepted: [second.lemma] },
      ],
    }
  }
  return {
    prompt: `Здесь ${first.gloss} и ${second.gloss}.`,
    targetText: `Tässä ovat ${first.lemma} ja ${second.lemma}.`,
    slots: [
      { role: 'place', accepted: ['tässä'] },
      { role: 'frame', accepted: ['ovat'] },
      { role: 'first', accepted: [first.lemma] },
      { role: 'conjunction', accepted: ['ja'] },
      { role: 'second', accepted: [second.lemma] },
    ],
  }
}
