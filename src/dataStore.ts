
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
    isGlobalOwner: 1 | 2; // 1 for global owner 2 for not global
}
type message = {
    messageId : number;
    uId : number;
    timeSent : number; // unix timestamp
    message : string;
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
}

let data: dataStoreType = {
  users: [],
  channels: []
};

/*
  Example usage
      let store = getData()
      console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

      names = store.names

      names.pop()
      names.push('Jake')

      console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
      setData(store)
  */

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataStoreType) {
  data = newData;
}

export { getData, setData };
export { user, message, channel, dataStoreType };
