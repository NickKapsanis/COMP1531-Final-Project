/*
adminUserpermissionChangeV1
Given a user by their user ID, set global their permissions to
 new permissions described by permissionId

Arguments:
    uId (number)    - uID of the user having its permission modified
    permissionId (number)   - permission Id to set the uId to
    token (string)  - token of the calling user

Return Value:
   throw 400 Error on
    -> uId not valid uID
    -> uID refers to the only global owner and is being demoted (must have 1+ global owner)
    -> permission Id is invalid (1 or 2)
    -> user already has the permission ID

    throw 403 Error on
    -> authUser is not a global owner.

    Returns {} on no error throw
*/
export function adminUserpermissionChangeV1(uID: number, permissionId: number, token: string) {
  return {};
}

/*
adminUserRemoveV1
Given a user by their uId, remove them from the Treats.
This means they should be removed from all channels/DMs,
and will not be included in the array of users returned by users/all.
Treats owners can remove other Treats owners
(including the original first owner).
Once users are removed, the contents of the messages they sent
will be replaced by 'Removed user'.
Their profile must still be retrievable with user/profile,
however nameFirst should be 'Removed' and nameLast should be 'user'.
The user's email and handle should be reusable.

Arguments:
    uId (number)    - uID of the user being removed
    token (string)  - token of the calling user

Return Value:
   throw 400 Error on
    -> uId not valid uID
    -> uID refers to the only global owner (must have 1+ global owner)

    throw 403 Error on
    -> authUser is not a global owner.

    Returns {} on no error throw
*/
export function adminUserRemoveV1(uID: number, token: string) {
  return {};
}
