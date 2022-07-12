import fs from 'fs';

type user = {
  uId: number;
  authUserId : number;
  tokens : string[];
  nameFirst: string;
  nameLast: string;
  email: string;
  password : string;
  handleStr: string;
  channels: number[];
  dms: number[];
  isGlobalOwner: 1 | 2; // 1 for global owner 2 for not global
}
type message = {
  messageId : number;
  uId : number;
  timeSent : number; // unix timestamp
  message : string;
}
type dm = {
    dmId: number;
    name: string;
    allMembers : number[]; // array of all memebrs user Id's
    owner : number; // array of all owners user Id's
    messages?: message[];
}
type channel = {
  channelId: number;
  name: string;
  isPublic : boolean;
  allMembers : number[]; // array of all memebrs user Id's
  ownerMembers : number[]; // array of all owners user Id's
  messages?: message[];
}
type dataStoreType = {
  users? : user[];
  channels? : channel[];
  dms? : dm[];
}

let data: dataStoreType = {
users: [],
channels: [],
dms: [],
};

// Use get() to access the data
function getData() {
const data = JSON.parse(String(fs.readFileSync('data.json', { flag: 'r' })));
return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataStoreType) {
data = newData;
fs.writeFileSync('data.json', JSON.stringify(data), { flag: 'w'});
}

export { getData, setData };
export { user, message, channel, dataStoreType };
