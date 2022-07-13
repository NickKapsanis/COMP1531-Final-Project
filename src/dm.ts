import {getData, setData, dm} from './dataStore';
import {getUId} from './other';

type dmIdObj = {
    dmId : number
}

type uId = number;

type uIds = Array<uId>;

type error = { 
    error : 'error' 
}

type dmsInfo = {
    dmId: number,
    name: string
}

type dms = dmsInfo[]

export function dmCreateV1(token : string, uIds : uIds) : dmIdObj | error  {
    let data = getData();
    let creator = data.users.find(user => user.tokens.find(t => t === token));
    let duplicateUIds = uIds => uIds.filter((item, index) => uIds.indexOf(item) != index);

    // Error cases
    if (creator === undefined) { return { error : 'error' } };
    if (duplicateUIds(uIds).length > 0) { return { error : 'error' } };

    const newDmId = data.dms.length + 1;

    const handleArray = [];
    for (let x of uIds) {
        let uIdUser = data.users.find(user => user.uId === x);
        if (uIdUser === undefined) { return { error : 'error' } };
        data.users = data.users.filter(i => i.authUserId !== uIdUser.uId);
        uIdUser.dms.push(newDmId);
        data.users.push(uIdUser);
        handleArray.push(uIdUser.handleStr);
    }

    handleArray.sort();
    const newDmName = handleArray.join(", ");

    let newDm : dm = {
        
        dmId: newDmId,
        name: newDmName,
        allMembers : uIds,
        owner : creator.uId, 
        messages: []
    }

    data.dms.push(newDm);
    data.users = data.users.filter(i => i.authUserId !== creator.authUserId);
    creator.dms.push(newDmId);
    data.users.push(creator);

    setData(data);

    return { dmId: newDmId };
}

export function dmListV1(token: string) : error | dms {
    let data = getData();
    let user = data.users.find(user => user.tokens.find(t => t === token));

    if (user === undefined) { return { error : 'error' } };

    let dms = [];

    for (let x of user.dms) {
        let dm = data.dms.find(dm => dm.dmId === x); 
        let obj = {
            dmId: dm.dmId,
            name: dm.name
        }
        dms.push(obj);
    }

    return dms;

}

export function dmRemoveV1(token: string, dmId: number) {
    let data = getData();
    let user = data.users.find(user => user.tokens.find(t => t === token));
    let dm = data.dms.find(dm => dm.dmId === dmId);

    if (user === undefined || dm === undefined) { return { error : 'error' } };
    if (user.uId !== dm.owner) { return { error : 'error' } };

    data.dms = data.dms.filter(i => i.dmId !== dmId);
    setData(data);
    return {};
 
}


