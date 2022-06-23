import {getData, setData} from './dataStore';
/*
clearV1 resets the data from dataStore.js to be empty as according to the structure in data.md

Arguments:
    VOID

Return Value:
    VOID
*/
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
