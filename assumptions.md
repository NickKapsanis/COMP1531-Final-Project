Assumptions

(1)
clearV1 in other.js assumes that the blank data object is of the form;
data = {
  users : [],
  channels : [],
};
It also assumes that getData and setData work appropriately.

(2)
Testing for getUId assumes that authUserId is never negative. 
i.e no authUserId can be -1.

(3)
Testing for userProfileV1 assumes that authUserId and uId are never negative. 
i.e no authUserId can be -1 and uId can not be -2.