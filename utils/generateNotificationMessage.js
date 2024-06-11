exports.generateNotificationMessage = body => {
  return `Вітаю!\nВам був призначений потік ${body.subgroupName}!\nКурс: ${
    body.selectedCourseName
  }\nВаш графік: \n${body.schedule.replaceAll(',', '\n')}`;
};
