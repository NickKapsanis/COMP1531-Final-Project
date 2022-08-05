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
  isActiveUser: boolean;
}
type react = {
  reactId : number;
  uIds : number[];
  isThisUserReacted : boolean;
}
type message = {
  messageId : number;
  uId : number;
  timeSent : number; // unix timestamp
  message : string;
  isPinned: boolean;
  reacts : react[];
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
  standupActiveTime : { isActive: boolean, timeFinish?: number };
  standupMessageBank : string[];
}
type passwordReset = {
  code: string,
  userEmail: string,
  timeToWait: number,
  timeStamp: number,
}

type dataStoreType = {
  users? : user[];
  channels? : channel[];
  dms? : dm[];
  passwordReset? : passwordReset[];
}

const data: dataStoreType = {
  users: [],
  channels: [],
  dms: [],
  passwordReset: [],
};

type userType = {
  token? : string;
  authUserId? : number;
}

// Use get() to access the data
// if the data.json file does not exist, create it by setting it with the data definition above and read from the created file.
function getData() : dataStoreType {
  try {
    const dataFromFile = JSON.parse(String(fs.readFileSync('data.json', { flag: 'r' })));
    return dataFromFile;
  } catch (err) {
    setData(data);
    return getData();
  }
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataStoreType) {
// data = newData;
  fs.writeFileSync('data.json', JSON.stringify(newData), { flag: 'w' });
}

export { getData, setData };
export { user, message, channel, dm, dataStoreType, userType };
