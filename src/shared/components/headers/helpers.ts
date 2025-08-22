import moment from "moment";

export const getGreetingTime = () => {
  const currentHour = Number(moment().format("H"));
  const split_afternoon: number = 12;
  const split_evening: number = 17;

  // return "evening";
  // return "morning";

  if (currentHour >= split_afternoon && currentHour <= split_evening)
    return "afternoon";
  else if (currentHour >= split_evening) return "evening";
  else return "morning";
};
