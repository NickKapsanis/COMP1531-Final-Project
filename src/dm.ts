import { getData, setData, dm } from './dataStore';

type dmIdObj = {
    dmId : number
}

type uId = number;

type uIds = uId[];

type error = {
    error : 'error'
}

export type dmListItem = {
  dmId: number,
  dmName: string
}

export type dmList = dmListItem[];

export function dmCreateV1(token : string, uIds : uIds) : dmIdObj | error {
  const data = getData();
  const creator = data.users.find(user => user.tokens.find(t => t === token));
  const duplicateUIds = uIds => uIds.filter((item, index) => uIds.indexOf(item) !== index);

  // Error cases
  if (creator === undefined) { return { error: 'error' }; }
  if (duplicateUIds(uIds).length > 0) { return { error: 'error' }; }

  const newDmId = data.dms.length + 1;

  const handleArray = [];
  for (const x of uIds) {
    const uIdUser = data.users.find(user => user.uId === x);
    if (uIdUser === undefined) { return { error: 'error' }; }
    data.users = data.users.filter(i => i.authUserId !== uIdUser.uId);
    uIdUser.dms.push(newDmId);
    data.users.push(uIdUser);
    handleArray.push(uIdUser.handleStr);
  }

  handleArray.sort();
  const newDmName = handleArray.join(', ');

  const newDm : dm = {

    dmId: newDmId,
    name: newDmName,
    allMembers: uIds,
    owner: creator.uId,
    messages: []
  };

  data.dms.push(newDm);
  data.users = data.users.filter(i => i.authUserId !== creator.authUserId);
  creator.dms.push(newDmId);
  data.users.push(creator);

  setData(data);

  return { dmId: newDmId };
}

export function dmListV1(token: string) {
  const data = getData();
  const user = data.users.find(user => user.tokens.find(t => t === token));

  if (user === undefined) { return { error: 'error' }; }

  const dms = [];

  for (const x of user.dms) {
    const dm = data.dms.find(dm => dm.dmId === x);
    const obj = {
      dmId: dm.dmId,
      name: dm.name
    };
    dms.push(obj);
  }

  return dms;
}

export function dmRemoveV1(token: string, dmId: number) {
  const data = getData();
  let user = data.users.find(user => user.tokens.find(t => t === token));
  const dm = data.dms.find(dm => dm.dmId === dmId);

  if (user === undefined || dm === undefined) { return { error: 'error' }; }
  if (user.uId !== dm.owner) { return { error: 'error' }; }

  const users = dm.allMembers;
  users.push(dm.owner);

  for (const x of users) {
    user = data.users.find(i => i.uId === x);
    data.users = data.users.filter(i => i.uId !== x);
    user.dms = user.dms.filter(i => i !== dmId);
    data.users.push(user);
  }

  data.dms = data.dms.filter(i => i.dmId !== dmId);
  setData(data);
  return {};
}
