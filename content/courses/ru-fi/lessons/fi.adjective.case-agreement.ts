import type { CourseLessonContentSeed, CourseSkillSeed } from '../module-one.js'
import type { LessonVocabularySeed } from './fi.olla.basics.js'
import { PLURAL_GENITIVE_SKILL_ID } from './fi.plural.genitive.js'

export const ADJECTIVE_CASE_AGREEMENT_SKILL_ID =
  'grammar.fi.adjective.case-agreement'
export const ADJECTIVE_CASE_GENITIVE_SKILL_ID =
  'grammar.fi.adjective.case-agreement.genitive'
export const ADJECTIVE_CASE_PARTITIVE_SKILL_ID =
  'grammar.fi.adjective.case-agreement.partitive'
export const ADJECTIVE_CASE_INTERNAL_SKILL_ID =
  'grammar.fi.adjective.case-agreement.internal'
export const ADJECTIVE_CASE_EXTERNAL_SKILL_ID =
  'grammar.fi.adjective.case-agreement.external'
export const ADJECTIVE_CASE_PLURAL_SKILL_ID =
  'grammar.fi.adjective.case-agreement.plural'
export const ADJECTIVE_CASE_PLURAL_GENITIVE_SKILL_ID =
  'grammar.fi.adjective.case-agreement.pluralgenitive'

export const adjectiveCaseAgreementSkills: CourseSkillSeed[] = [
  {
    id: ADJECTIVE_CASE_AGREEMENT_SKILL_ID,
    kind: 'GRAMMAR',
    name: { ru: 'Согласование прилагательного с существительным' },
    description: {
      ru: 'Прилагательное принимает тот же падеж и число, что и определяемое существительное.',
    },
    prerequisiteSkillIds: [PLURAL_GENITIVE_SKILL_ID],
  },
  {
    id: ADJECTIVE_CASE_GENITIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Согласование в генитиве единственного числа' },
    description: {
      ru: 'Оба слова получают форму генитива: hiljaisen kylän, raskaan laukun.',
    },
    prerequisiteSkillIds: [ADJECTIVE_CASE_AGREEMENT_SKILL_ID],
  },
  {
    id: ADJECTIVE_CASE_PARTITIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Согласование в партитиве' },
    description: {
      ru: 'Прилагательное повторяет партитив существительного в единственном и множественном числе.',
    },
    prerequisiteSkillIds: [ADJECTIVE_CASE_AGREEMENT_SKILL_ID],
  },
  {
    id: ADJECTIVE_CASE_INTERNAL_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Согласование во внутренних местных падежах' },
    description: {
      ru: 'Обе части группы отвечают на один вопрос: korkeassa rakennuksessa, korkeasta rakennuksesta, korkeaan rakennukseen.',
    },
    prerequisiteSkillIds: [ADJECTIVE_CASE_AGREEMENT_SKILL_ID],
  },
  {
    id: ADJECTIVE_CASE_EXTERNAL_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Согласование во внешних местных падежах' },
    description: {
      ru: 'Прилагательное и существительное вместе получают -lla/-llä, -lta/-ltä или -lle.',
    },
    prerequisiteSkillIds: [ADJECTIVE_CASE_AGREEMENT_SKILL_ID],
  },
  {
    id: ADJECTIVE_CASE_PLURAL_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Согласование во множественном числе' },
    description: {
      ru: 'Показатель множественного числа появляется и в прилагательном, и в существительном: sinisissä laukuissa.',
    },
    prerequisiteSkillIds: [ADJECTIVE_CASE_AGREEMENT_SKILL_ID],
  },
  {
    id: ADJECTIVE_CASE_PLURAL_GENITIVE_SKILL_ID,
    kind: 'SPECIFIC_SKILL',
    name: { ru: 'Согласование в генитиве множественного числа' },
    description: {
      ru: 'И прилагательное, и существительное стоят в генитиве множественного числа: korkeiden rakennusten ikkunat.',
    },
    prerequisiteSkillIds: [ADJECTIVE_CASE_AGREEMENT_SKILL_ID],
  },
]

export const adjectiveCaseAgreementContent: CourseLessonContentSeed = {
  version: 1,
  sections: ['explanation', 'vocabulary', 'practice'],
  explanationScreens: [
    {
      id: 'adjective-agreement-principle',
      title: { ru: 'Прилагательное повторяет форму существительного' },
      paragraphs: [
        {
          ru: 'В финском определение согласуется с существительным в падеже и числе. Изменяется не только существительное: sininen laukku — sinisessä laukussa — sinisissä laukuissa.',
        },
        {
          ru: 'У прилагательного может быть своя основа и своё чередование согласных. Поэтому окончания совпадают по функции, но формы образуются независимо: märkä takki — märässä takissa.',
        },
      ],
      examples: [
        {
          target: 'Sininen laukku on tuolilla.',
          source: { ru: 'Синяя сумка находится на стуле.' },
        },
        {
          target: 'Kirja on sinisessä laukussa.',
          source: { ru: 'Книга находится в синей сумке.' },
        },
        {
          target: 'Kirjat ovat sinisissä laukuissa.',
          source: { ru: 'Книги находятся в синих сумках.' },
        },
      ],
    },
    {
      id: 'adjective-agreement-genitive-partitive',
      title: { ru: 'Генитив и партитив: два слова — две формы' },
      paragraphs: [
        {
          ru: 'В генитиве единственного числа оба слова получают -n: raskas laukku → raskaan laukun. Такая группа может обозначать принадлежность или полный объект.',
        },
        {
          ru: 'В партитиве изменяются оба слова: seuraavaa bussia, voimakasta ääntä. Причина выбора партитива остаётся прежней: процесс, отрицание, количество или управление глагола.',
        },
      ],
      table: {
        headers: [{ ru: 'Падеж' }, { ru: 'Форма' }, { ru: 'Пример' }],
        rows: [
          [
            { ru: 'Номинатив' },
            { ru: 'raskas laukku' },
            { ru: 'Raskas laukku on tässä.' },
          ],
          [
            { ru: 'Генитив' },
            { ru: 'raskaan laukun' },
            { ru: 'Nostan raskaan laukun.' },
          ],
          [
            { ru: 'Партитив' },
            { ru: 'raskasta laukkua' },
            { ru: 'Kannatko raskasta laukkua?' },
          ],
        ],
      },
      examples: [
        {
          target: 'Nostan raskaan laukun.',
          source: { ru: 'Я подниму тяжёлую сумку.' },
        },
        {
          target: 'Odotan seuraavaa bussia.',
          source: { ru: 'Я жду следующий автобус.' },
        },
        {
          target: 'Kuuntelen voimakasta ääntä.',
          source: { ru: 'Я слушаю громкий звук.' },
        },
      ],
    },
    {
      id: 'adjective-agreement-internal',
      title: { ru: 'Внутренние падежи: где, откуда, куда' },
      paragraphs: [
        {
          ru: 'Внутренний местный падеж ставится на каждом слове группы: korkeassa rakennuksessa, korkeasta rakennuksesta, korkeaan rakennukseen.',
        },
        {
          ru: 'Сначала выбери направление всей группы, затем образуй нужную форму отдельно у прилагательного и существительного.',
        },
      ],
      examples: [
        {
          target: 'Työskentelen valoisassa toimistossa.',
          source: { ru: 'Я работаю в светлом офисе.' },
        },
        {
          target: 'Tulen hiljaisesta kylästä.',
          source: { ru: 'Я приезжаю из тихой деревни.' },
        },
        {
          target: 'Menemme turvalliseen hotelliin.',
          source: { ru: 'Мы идём в безопасный отель.' },
        },
      ],
    },
    {
      id: 'adjective-agreement-external',
      title: { ru: 'Внешние падежи тоже ставятся дважды' },
      paragraphs: [
        {
          ru: 'Внешняя серия работает так же: kapealla kadulla, ystävälliseltä opettajalta, nälkäiselle lapselle. Оба слова отвечают на один вопрос.',
        },
        {
          ru: 'Форма прилагательного не меняет уже знакомого значения падежа. Она лишь показывает, что признак относится именно к этому существительному.',
        },
      ],
      examples: [
        {
          target: 'Kävelen kapealla kadulla.',
          source: { ru: 'Я иду по узкой улице.' },
        },
        {
          target: 'Saan viestin ystävälliseltä opettajalta.',
          source: { ru: 'Я получаю сообщение от дружелюбного преподавателя.' },
        },
        {
          target: 'Annan ruokaa nälkäiselle lapselle.',
          source: { ru: 'Я даю еду голодному ребёнку.' },
        },
      ],
    },
    {
      id: 'adjective-agreement-plural',
      title: { ru: 'Во множественном числе изменяются оба слова' },
      paragraphs: [
        {
          ru: 'Во множественном числе показатель -i- появляется в обеих формах: sinisissä laukuissa, kapeilla kaduilla, kuivia vaatteita.',
        },
        {
          ru: 'Партитив множественного числа у прилагательных образуется по тем же типам, что и у существительных: korkea → korkeita, sininen → sinisiä, kevyt → kevyitä.',
        },
      ],
      examples: [
        {
          target: 'Ostan kuivia vaatteita.',
          source: { ru: 'Я покупаю сухую одежду.' },
        },
        {
          target: 'Kävelemme kapeilla kaduilla.',
          source: { ru: 'Мы ходим по узким улицам.' },
        },
        {
          target: 'Kirjat ovat tummissa laukuissa.',
          source: { ru: 'Книги находятся в тёмных сумках.' },
        },
      ],
    },
    {
      id: 'adjective-agreement-plural-genitive',
      title: { ru: 'Генитив множественного числа согласуется полностью' },
      paragraphs: [
        {
          ru: 'В группе с генитивом множественного числа изменяются оба слова: korkeiden rakennusten ikkunat, ystävällisten opettajien viestit.',
        },
        {
          ru: 'Окончания прилагательного и существительного не обязаны выглядеть одинаково. Главное, чтобы обе формы выражали генитив множественного числа.',
        },
      ],
      examples: [
        {
          target: 'Korkeiden rakennusten ikkunat ovat suuria.',
          source: { ru: 'Окна высоких зданий большие.' },
        },
        {
          target: 'Ystävällisten opettajien viestit ovat lyhyitä.',
          source: { ru: 'Сообщения дружелюбных преподавателей короткие.' },
        },
        {
          target: 'Kapeiden katujen nimet ovat kartassa.',
          source: { ru: 'Названия узких улиц находятся на карте.' },
        },
      ],
      callout: {
        ru: 'Проверка: найди существительное, определи его число и падеж, затем поставь прилагательное в те же число и падеж.',
      },
    },
  ],
}

interface AdjectiveSeed {
  lemma: string
  gloss: string
  sourcePlural: string
  forms: string[]
  exampleTarget: string
  exampleSource: string
}

const adjectives: AdjectiveSeed[] = [
  adjective(
    'seuraava',
    'следующий',
    'следующие',
    'seuraava seuraavan seuraavaa seuraavassa seuraavasta seuraavaan seuraavalla seuraavalta seuraavalle seuraavat seuraavien seuraavia seuraavissa seuraavista seuraaviin seuraavilla seuraavilta seuraaville',
    'Odotan seuraavaa bussia.',
    'Я жду следующий автобус.',
  ),
  adjective(
    'voimakas',
    'сильный, интенсивный',
    'сильные, интенсивные',
    'voimakas voimakkaan voimakasta voimakkaassa voimakkaasta voimakkaaseen voimakkaalla voimakkaalta voimakkaalle voimakkaat voimakkaiden voimakkaita voimakkaissa voimakkaista voimakkaisiin voimakkailla voimakkailta voimakkaille',
    'Kuuntelen voimakasta ääntä.',
    'Я слушаю громкий звук.',
  ),
  adjective(
    'sininen',
    'синий',
    'синие',
    'sininen sinisen sinistä sinisessä sinisestä siniseen sinisellä siniseltä siniselle siniset sinisten sinisiä sinisissä sinisistä sinisiin sinisillä sinisiltä sinisille',
    'Kirja on sinisessä laukussa.',
    'Книга находится в синей сумке.',
  ),
  adjective(
    'ylimääräinen',
    'лишний, дополнительный',
    'лишние, дополнительные',
    'ylimääräinen ylimääräisen ylimääräistä ylimääräisessä ylimääräisestä ylimääräiseen ylimääräisellä ylimääräiseltä ylimääräiselle ylimääräiset ylimääräisten ylimääräisiä ylimääräisissä ylimääräisistä ylimääräisiin ylimääräisillä ylimääräisiltä ylimääräisille',
    'Teen ylimääräisen tehtävän.',
    'Я выполню дополнительное задание.',
  ),
  adjective(
    'erityinen',
    'особенный',
    'особенные',
    'erityinen erityisen erityistä erityisessä erityisestä erityiseen erityisellä erityiseltä erityiselle erityiset erityisten erityisiä erityisissä erityisistä erityisiin erityisillä erityisiltä erityisille',
    'Muistan erityisen päivän.',
    'Я помню особенный день.',
  ),
  adjective(
    'yksinkertainen',
    'простой, несложный',
    'простые, несложные',
    'yksinkertainen yksinkertaisen yksinkertaista yksinkertaisessa yksinkertaisesta yksinkertaiseen yksinkertaisella yksinkertaiselta yksinkertaiselle yksinkertaiset yksinkertaisten yksinkertaisia yksinkertaisissa yksinkertaisista yksinkertaisiin yksinkertaisilla yksinkertaisilta yksinkertaisille',
    'Täytän yksinkertaista lomaketta.',
    'Я заполняю простую анкету.',
  ),
  adjective(
    'yhteinen',
    'общий, совместный',
    'общие, совместные',
    'yhteinen yhteisen yhteistä yhteisessä yhteisestä yhteiseen yhteisellä yhteiseltä yhteiselle yhteiset yhteisten yhteisiä yhteisissä yhteisistä yhteisiin yhteisillä yhteisiltä yhteisille',
    'Puhumme yhteisestä projektista.',
    'Мы говорим об общем проекте.',
  ),
  adjective(
    'raskas',
    'тяжёлый',
    'тяжёлые',
    'raskas raskaan raskasta raskaassa raskaasta raskaaseen raskaalla raskaalta raskaalle raskaat raskaiden raskaita raskaissa raskaista raskaisiin raskailla raskailta raskaille',
    'Nostan raskaan laukun.',
    'Я подниму тяжёлую сумку.',
  ),
  adjective(
    'korkea',
    'высокий',
    'высокие',
    'korkea korkean korkeaa korkeassa korkeasta korkeaan korkealla korkealta korkealle korkeat korkeiden korkeita korkeissa korkeista korkeisiin korkeilla korkeilta korkeille',
    'Työskentelen korkeassa rakennuksessa.',
    'Я работаю в высоком здании.',
  ),
  adjective(
    'kapea',
    'узкий',
    'узкие',
    'kapea kapean kapeaa kapeassa kapeasta kapeaan kapealla kapealta kapealle kapeat kapeiden kapeita kapeissa kapeista kapeisiin kapeilla kapeilta kapeille',
    'Kävelen kapealla kadulla.',
    'Я иду по узкой улице.',
  ),
  adjective(
    'tumma',
    'тёмный',
    'тёмные',
    'tumma tumman tummaa tummassa tummasta tummaan tummalla tummalta tummalle tummat tummien tummia tummissa tummista tummiin tummilla tummilta tummille',
    'Ostan tumman takin.',
    'Я куплю тёмное пальто.',
  ),
  adjective(
    'märkä',
    'мокрый',
    'мокрые',
    'märkä märän märkää märässä märästä märkään märällä märältä märälle märät märkien märkiä märissä märistä märkiin märillä märiltä märille',
    'Pesen märkää takkia.',
    'Я стираю мокрое пальто.',
  ),
  adjective(
    'hiljainen',
    'тихий',
    'тихие',
    'hiljainen hiljaisen hiljaista hiljaisessa hiljaisesta hiljaiseen hiljaisella hiljaiselta hiljaiselle hiljaiset hiljaisten hiljaisia hiljaisissa hiljaisista hiljaisiin hiljaisilla hiljaisilta hiljaisille',
    'Asun hiljaisessa kylässä.',
    'Я живу в тихой деревне.',
  ),
  adjective(
    'keltainen',
    'жёлтый',
    'жёлтые',
    'keltainen keltaisen keltaista keltaisessa keltaisesta keltaiseen keltaisella keltaiselta keltaiselle keltaiset keltaisten keltaisia keltaisissa keltaisista keltaisiin keltaisilla keltaisilta keltaisille',
    'Panen kirjan keltaiseen laukkuun.',
    'Я кладу книгу в жёлтую сумку.',
  ),
  adjective(
    'viimeinen',
    'последний',
    'последние',
    'viimeinen viimeisen viimeistä viimeisessä viimeisestä viimeiseen viimeisellä viimeiseltä viimeiselle viimeiset viimeisten viimeisiä viimeisissä viimeisistä viimeisiin viimeisillä viimeisiltä viimeisille',
    'Muistan viimeisen päivän.',
    'Я помню последний день.',
  ),
  adjective(
    'upea',
    'великолепный',
    'великолепные',
    'upea upean upeaa upeassa upeasta upeaan upealla upealta upealle upeat upeiden upeita upeissa upeista upeisiin upeilla upeilta upeille',
    'Katson upeaa kuvaa.',
    'Я смотрю на великолепную фотографию.',
  ),
  adjective(
    'nälkäinen',
    'голодный',
    'голодные',
    'nälkäinen nälkäisen nälkäistä nälkäisessä nälkäisestä nälkäiseen nälkäisellä nälkäiseltä nälkäiselle nälkäiset nälkäisten nälkäisiä nälkäisissä nälkäisistä nälkäisiin nälkäisillä nälkäisiltä nälkäisille',
    'Annan ruokaa nälkäiselle lapselle.',
    'Я даю еду голодному ребёнку.',
  ),
  adjective(
    'valoisa',
    'светлый',
    'светлые',
    'valoisa valoisan valoisaa valoisassa valoisasta valoisaan valoisalla valoisalta valoisalle valoisat valoisien valoisia valoisissa valoisista valoisiin valoisilla valoisilta valoisille',
    'Työskentelen valoisassa toimistossa.',
    'Я работаю в светлом офисе.',
  ),
  adjective(
    'onnellinen',
    'счастливый',
    'счастливые',
    'onnellinen onnellisen onnellista onnellisessa onnellisesta onnelliseen onnellisella onnelliselta onnelliselle onnelliset onnellisten onnellisia onnellisissa onnellisista onnellisiin onnellisilla onnellisilta onnellisille',
    'Puhun onnellisesta perheestä.',
    'Я говорю о счастливой семье.',
  ),
  adjective(
    'tavallinen',
    'обычный',
    'обычные',
    'tavallinen tavallisen tavallista tavallisessa tavallisesta tavalliseen tavallisella tavalliselta tavalliselle tavalliset tavallisten tavallisia tavallisissa tavallisista tavallisiin tavallisilla tavallisilta tavallisille',
    'Ostan tavallisen lipun.',
    'Я куплю обычный билет.',
  ),
  adjective(
    'turvallinen',
    'безопасный',
    'безопасные',
    'turvallinen turvallisen turvallista turvallisessa turvallisesta turvalliseen turvallisella turvalliselta turvalliselle turvalliset turvallisten turvallisia turvallisissa turvallisista turvallisiin turvallisilla turvallisilta turvallisille',
    'Menemme turvalliseen hotelliin.',
    'Мы идём в безопасный отель.',
  ),
  adjective(
    'vaarallinen',
    'опасный',
    'опасные',
    'vaarallinen vaarallisen vaarallista vaarallisessa vaarallisesta vaaralliseen vaarallisella vaaralliselta vaaralliselle vaaralliset vaarallisten vaarallisia vaarallisissa vaarallisista vaarallisiin vaarallisilla vaarallisilta vaarallisille',
    'En mene vaaralliseen paikkaan.',
    'Я не иду в опасное место.',
  ),
  adjective(
    'ystävällinen',
    'дружелюбный',
    'дружелюбные',
    'ystävällinen ystävällisen ystävällistä ystävällisessä ystävällisestä ystävälliseen ystävällisellä ystävälliseltä ystävälliselle ystävälliset ystävällisten ystävällisiä ystävällisissä ystävällisistä ystävällisiin ystävällisillä ystävällisiltä ystävällisille',
    'Saan viestin ystävälliseltä opettajalta.',
    'Я получаю сообщение от дружелюбного преподавателя.',
  ),
  adjective(
    'kohtelias',
    'вежливый',
    'вежливые',
    'kohtelias kohteliaan kohteliasta kohteliaassa kohteliaasta kohteliaaseen kohteliaalla kohteliaalta kohteliaalle kohteliaat kohteliaiden kohteliaita kohteliaissa kohteliaista kohteliaisiin kohteliailla kohteliailta kohteliaille',
    'Vastaan kohteliaalle asiakkaalle.',
    'Я отвечаю вежливому клиенту.',
  ),
  adjective(
    'kuiva',
    'сухой',
    'сухие',
    'kuiva kuivan kuivaa kuivassa kuivasta kuivaan kuivalla kuivalta kuivalle kuivat kuivien kuivia kuivissa kuivista kuiviin kuivilla kuivilta kuiville',
    'Panen vaatteet kuivaan laukkuun.',
    'Я кладу одежду в сухую сумку.',
  ),
  adjective(
    'kevyt',
    'лёгкий, нетяжёлый',
    'лёгкие, нетяжёлые',
    'kevyt kevyen kevyttä kevyessä kevyestä kevyeen kevyellä kevyeltä kevyelle kevyet kevyiden kevyitä kevyissä kevyistä kevyisiin kevyillä kevyiltä kevyille',
    'Nostan kevyen laatikon.',
    'Я подниму лёгкую коробку.',
  ),
]

export const adjectiveCaseAgreementVocabulary: LessonVocabularySeed[] =
  adjectives.map((item, index) => adjectiveVocabulary(item, index + 1))

function adjective(
  lemma: string,
  gloss: string,
  sourcePlural: string,
  forms: string,
  exampleTarget: string,
  exampleSource: string,
): AdjectiveSeed {
  return {
    lemma,
    gloss,
    sourcePlural,
    forms: forms.split(' '),
    exampleTarget,
    exampleSource,
  }
}

function adjectiveVocabulary(
  item: AdjectiveSeed,
  position: number,
): LessonVocabularySeed {
  const serial = serialFor(position)
  const [
    nominativeSingular,
    genitiveSingular,
    partitiveSingular,
    inessiveSingular,
    elativeSingular,
    illativeSingular,
    adessiveSingular,
    ablativeSingular,
    allativeSingular,
    nominativePlural,
    genitivePlural,
    partitivePlural,
    inessivePlural,
    elativePlural,
    illativePlural,
    adessivePlural,
    ablativePlural,
    allativePlural,
  ] = item.forms

  const declaredForms = [
    nominativeSingular,
    genitiveSingular,
    partitiveSingular,
    inessiveSingular,
    elativeSingular,
    illativeSingular,
    adessiveSingular,
    ablativeSingular,
    allativeSingular,
    nominativePlural,
    genitivePlural,
    partitivePlural,
    inessivePlural,
    elativePlural,
    illativePlural,
    adessivePlural,
    ablativePlural,
    allativePlural,
  ]
  if (declaredForms.some((surface) => !surface)) {
    throw new Error(`${item.lemma} must declare all agreement forms`)
  }

  return {
    ...identity(serial, item.lemma),
    lemma: item.lemma,
    partOfSpeech: 'adjective',
    gloss: item.gloss,
    example: {
      target: item.exampleTarget,
      source: { ru: item.exampleSource },
    },
    semanticTypes: ['module-two', 'adjective-case-agreement'],
    singular: item.lemma,
    plural: nominativePlural!,
    sourceSingular: item.gloss,
    sourcePlural: item.sourcePlural,
    forms: [
      form(
        serial,
        'nominative-singular',
        nominativeSingular!,
        'nominative',
        'singular',
      ),
      form(
        serial,
        'genitive-singular',
        genitiveSingular!,
        'genitive',
        'singular',
      ),
      form(
        serial,
        'partitive-singular',
        partitiveSingular!,
        'partitive',
        'singular',
      ),
      form(
        serial,
        'inessive-singular',
        inessiveSingular!,
        'inessive',
        'singular',
      ),
      form(serial, 'elative-singular', elativeSingular!, 'elative', 'singular'),
      form(
        serial,
        'illative-singular',
        illativeSingular!,
        'illative',
        'singular',
      ),
      form(
        serial,
        'adessive-singular',
        adessiveSingular!,
        'adessive',
        'singular',
      ),
      form(
        serial,
        'ablative-singular',
        ablativeSingular!,
        'ablative',
        'singular',
      ),
      form(
        serial,
        'allative-singular',
        allativeSingular!,
        'allative',
        'singular',
      ),
      form(
        serial,
        'nominative-plural',
        nominativePlural!,
        'nominative',
        'plural',
      ),
      form(serial, 'genitive-plural', genitivePlural!, 'genitive', 'plural'),
      form(serial, 'partitive-plural', partitivePlural!, 'partitive', 'plural'),
      form(serial, 'inessive-plural', inessivePlural!, 'inessive', 'plural'),
      form(serial, 'elative-plural', elativePlural!, 'elative', 'plural'),
      form(serial, 'illative-plural', illativePlural!, 'illative', 'plural'),
      form(serial, 'adessive-plural', adessivePlural!, 'adessive', 'plural'),
      form(serial, 'ablative-plural', ablativePlural!, 'ablative', 'plural'),
      form(serial, 'allative-plural', allativePlural!, 'allative', 'plural'),
    ],
  }
}

function identity(serial: string, lemma: string) {
  return {
    key: `m2-${serial.replace('.', '-')}`,
    itemId: `word.fi.m2.${serial}`,
    conceptId: `concept.fi.m2.${serial}`,
    lexicalEntryId: `lex.fi.${lemma}`,
  }
}

function serialFor(position: number) {
  return `08.${String(position).padStart(2, '0')}`
}

function form(
  serial: string,
  key: string,
  surface: string,
  grammaticalCase: string,
  number: string,
) {
  return {
    id: `form.fi.m2.${serial}.${key}`,
    surface,
    features: { case: grammaticalCase, number },
  }
}
