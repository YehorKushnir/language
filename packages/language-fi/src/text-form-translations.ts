const translationSource = `
olen|я есть; я являюсь
ystäväni|мой друг; моя подруга
on|есть; является
aamulla|утром
luen|я читаю
kirjaa|книгу
kirjoitan|я пишу
viestin|сообщение
minulla|у меня
kysyy|спрашивает
vastaan|я отвечаю
illalla|вечером
haluan|я хочу
kotiin|домой
uutisia|новости
en|я не
ymmärrä|понимаю (с отрицанием: не понимаю)
kaikkea|всё
opin|я учусь; я научился / научилась
olemme|мы являемся
asumme|мы живём
kaupungissa|в городе
jossa|в котором
haluaa|хочет
oven|дверь
voin|я могу
osaa|умеет
suunnittelemme|мы планируем
matkaa|поездку
tarvitsemme|нам нужны; мы нуждаемся
lipun|билет
laukun|сумку
avaimen|ключ
lauantaina|в субботу
menemme|мы идём
torille|на рынок; на площадь
ostamme|мы покупаем
leipää|хлеб
maitoa|молоко
juustoa|сыр
kalaa|рыбу
perunoita|картофель
omenoita|яблоки
sen|его; этого
juon|я пью
kahvia|кофе
kahvilassa|в кафе
teetä|чай
iltapäivällä|днём; во второй половине дня
käymme|мы посещаем; мы заходим
kirjastossa|в библиотеке
museossa|в музее
pidän|я люблю; мне нравится
musiikista|музыку; о музыке
lukemisesta|чтение; о чтении
päivässä|за день; в дне
iloa|радость
lähdimme|мы отправились
rautatieasemalta|с железнодорожного вокзала
oli|был; была; было
ikkunasta|из окна
näin|я увидел; я увидела
metsän|лес
järven|озеро
joen|реку
suuren|большого; большой
vuoren|гору
tulimme|мы пришли; мы приехали
hotelliin|в отель
söimme|мы ели; мы поели
ravintolassa|в ресторане
seuraavana|на следующий; следующим
päivänä|днём; в день
lämmitti|согревало
eikä|и не
tullut|пришёл; пришла; пришло
tulin|я приехал; я приехала
suomeen|в Финляндию
aluksi|сначала
olin|я был; я была
olivat|были
menin|я пошёл; я пошла
yliopistoon|в университет
bussilla|на автобусе
opiskelin|я учился; я училась
uuden|новое; нового
sanan|слово
puhuimme|мы говорили
suomea|по-фински; финский язык
kirjoitin|я написал; я написала
ystävälle|другу; подруге
viikonloppuna|на выходных
ostin|я купил; я купила
ruokaa|еду
torilta|с рынка; с площади
katsoimme|мы посмотрели
elokuvan|фильм
kävelimme|мы гуляли; мы ходили пешком
puistossa|в парке
kerran|однажды; один раз
matkustin|я путешествовал; я путешествовала
junalla|на поезде
meren|моря
rannalle|на берег
tuli|пришёл; появился; вышел
ymmärrän|я понимаю
opiskelua|учёбу; обучение
`

const translations = new Map(
  translationSource
    .trim()
    .split('\n')
    .map((line) => {
      const separator = line.indexOf('|')
      return [line.slice(0, separator), line.slice(separator + 1)] as const
    }),
)

export function getFinnishTextFormTranslation(
  surface: string,
): string | undefined {
  return translations.get(
    surface.normalize('NFC').toLocaleLowerCase('fi').trim(),
  )
}

export const finnishTextFormTranslationCount = translations.size
