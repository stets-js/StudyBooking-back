const {User} = require('../models/relation');

const names = {
  'Логвиненко Олександр': [],
  'Самарська Софія': [],
  'Соколова Ірина': [],
  'Петришин Оксана': [],
  'Магар Владислав': [],
  'Зеньо Роман': [],
  'Іпатенко Володимир': [],
  'Сербін Олександр': [],
  'Тищенко Сергій': [],
  'Фауст Артем': [],
  'Галенко Богдана': [],
  'Кучерук Ольга': [],
  'Гунько Ольга': [],
  'Тарасович Тетяна': [],
  'Бусова Альона': [],
  'Грінько Сергій': [],
  'Коркішко Ілля': [],
  'Бегма Андрій': [],
  'Середенко Євгенія': [],
  "Дзівідзінська Мар'яна": [],
  'Михайленко Юлія': [],
  'Кондратюк Богдан': [],
  'Глушаниця Роман': [],
  'Чмелюк Карина': [],
  'Свириденко Володимир': [],
  'Сергєєв Василь': [],
  'Берестень Дмитро': [],
  'Климкович Іван': [],
  'Чайковський Віталій': [],
  'Власенко Наталія': [],
  'Зінич Євгеній': [],
  'Манько Сергій': [],
  'Доля Руслан': [],
  'Абрамович Олександр': [],
  'Семенюк Катерина': [],
  'Клещ Катерина': [],
  'Горбунов Юрій': [],
  'Залозний Вадим': [],
  'Сальков Андрій': [],
  'Баскін Ростислав': [],
  'Медведовський Іван': [],
  'Пінчук Максим': [],
  'Дмитрів Андрій': [],
  'Дідківська Ірина': [],
  'Желізко Віктор': [],
  'Царук Олена': [],
  'Шпак Наталія': []
};

const findEmails = async () => {
  for (const [key, value] of Object.entries(names)) {
    const emails = await User.findAll({where: {name: key}, attributes: ['email']});
    console.log(emails);
    names[key] = [...names[key], ...emails.map(email => email.email)];
  }
  console.log(names);
};

module.exports = findEmails;