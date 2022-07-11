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

(4)
When testing for channelMessagesV1, we assume that there are no messages in the 
channel and therefore we expect the function to return {messages: [], start: 0, 
end: -1}, where [] is an empty array. 

(5) 
When testing for channelMessageV1, we assume that the start index is greater than 
or equal to zero. 

(6)
When testing all files, we assume tests will fail at the intended point, however
as all errors have the same error message (as per the specs), there is a possibilty
tests match the intended output (error : error), but at incorrect points 

(7)
Both global and channel owners can add and remove themselves as channel owners
