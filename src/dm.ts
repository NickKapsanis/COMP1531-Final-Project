/*
dmDetailsV1 takes a dmId and an active token and returns basic details about the DM

Arguments:
    dmId    - the Id of the DM channel
    token    - the session token of the user calling the request

Return Value:
    Returns an object with {name, members} if no error
    Returns {error: 'error'} if any of,
     dmID is not valid
     dmID is valid but authUserId is not a member of the DM
     token us not valid
*/
export function dmDetailsV1(token: string, dmId: number) {
    return { token };
};