const {User} = require('../models/relation');

const names = {
  'Сєркова Тетяна': '',
  'Маргаріт Марина': '',
  'Карлова Анастасія': '',
  'Яцимірська Ольга': '',
  'Микитюк Юліанна': '',
  'Городецька Анастасія': '',
  'Гурʼєва Наталія': '',
  'Боровко Римма': '',
  'Куліш Юлія': '',
  'Говорун Маргаріта': '',
  'Ільющенко Марія': '',
  'Бібікова Єлизавета': '',
  'Харченко Анна': '',
  'Ратушна Наталія': '',
  'Осипенко Ганна': '',
  'Різнічок Ірина': '',
  'Корнюк Владислав': '',
  'Борисова Ксенія': '',
  'Акритова Аліна': '',
  'Карпенко Зоряна': '',
  'Сорока Каріна': '',
  'Бугайова Ярослава': '',
  'Сокол Тетяна': '',
  'Босой Олена': '',
  'Жук Анна': '',
  'Петеляк Юлія': '',
  'Таченко Оксана': '',
  'Мороз Ольга': '',
  'Полєшко Аліна': '',
  'Пушкарьова Дарʼя': '',
  'Полєєва Тетяна': '',
  'Копина Христина': '',
  'Боровікова Марина': '',
  'Трубчанінов Павло': '',
  'Ахметова Вікторія': '',
  'Матвійчук Леся': '',
  'Ванда Вікторія': '',
  'Смотрова Ольга': '',
  'Переверзева Емілія': '',
  'Фрей Олеся': '',
  'Мельнічук Анастасія': '',
  'Скрипка Андрій': '',
  'Баннікова Єлизавета': '',
  'Лісова Вікторія': '',
  'Кирилишена Лілія': '',
  'Шуба Карина': '',
  'Опрісник Галина': '',
  'Катрич Кристина': '',
  'Власенко Єлизавета': '',
  'Мороз Єва': '',
  'Фурзенко Карина': '',
  'Данилюк Євгенія': '',
  'Луцик Наталія': '',
  'Прус Марина': '',
  'Живкова Марія': '',
  'Хачатурова Ельвіра': '',
  'Зябченко Ірина': ''
};

const findEmails = async () => {
  for (const [key, value] of Object.entries(names)) {
    const emails = await User.findAll({where: {name: key}, attributes: ['email']});
    names[key] = emails[0]?.email;
  }
  console.log(Object.values(names));
};

module.exports = findEmails;
