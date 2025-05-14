export const convertTime = (time: number) => {
  const hours = Math.floor(time / 60);
  const minutes = Math.floor(time % 60);

  return `  ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
};
export const calcFinishTime = (start: string, runtime: number) => {
  const s = start.split(":").map(Number);
  const convert = s[0] * 60 + s[1];
  const result = convert + runtime;
  return convertTime(result);
};
