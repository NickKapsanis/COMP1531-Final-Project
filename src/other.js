import {getData, setData} from './dataStore';

function clearV1() {
  let data = getData();
  data = {
    users : [],
    channels : [],
  };
  setData(data);
  return {};
}

export { clearV1 };
