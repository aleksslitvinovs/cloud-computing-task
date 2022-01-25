import moment from "moment";

const exitTime = moment(new Date().toISOString(), true);

const entryTime = moment('2022-01-24T19:08:30.649Z');

const duration = moment.duration(exitTime.diff(entryTime));

console.log(duration);

console.log(
    `Duration: ${duration.asHours()} h ${duration.asMinutes()} m ${duration.asSeconds()} s`
  );