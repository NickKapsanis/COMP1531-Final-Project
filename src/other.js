import { setData } from "./dataStore";

function clearV1() {
  const newdata = {
    users : [],
    channels : [],
  };
  setData(newdata);
  return {};
}

export { clearV1 };
