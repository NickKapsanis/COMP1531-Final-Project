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