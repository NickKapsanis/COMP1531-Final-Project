import { checkValidToken } from './auth';
import { getData, setData, dm, dataStoreType } from './dataStore';
import { checkValidUids } from './other';

export type dmListItem = {
  dmId: number,
  name: string,
}

export type dmList = { dms: dmListItem[]};

export function dmCreateV1(token: string, uIds: number[]) {
  const data: dataStoreType = getData();
  // Input checking 3 possible failures
  // token is invalid
  if (!checkValidToken(token)) return { error: 'error' };
  // any uId in uIds is invalid
  if (!checkValidUids(uIds)) return { error: 'error' };
  // duplicate uId in uIds by comparing array size to set size
  if (uIds.length !== new Set(uIds).size) return { error: 'error' };
  // if all above if's are passed over all input is valid and safe to reference into.

  const creator = data.users.find(user => user.tokens.find(t => t === token));
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

  const dmsArray = [];

  for (const x of user.dms) {
    const dm = data.dms.find(dm => dm.dmId === x);
    const obj = {
      dmId: dm.dmId,
      name: dm.name
    };
    dmsArray.push(obj);
  }

  return { dms: dmsArray };
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
