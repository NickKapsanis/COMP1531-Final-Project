```javascript
// TODO: insert your data structure that contains users + channels info here
// You may also add a short description explaining your design

/* Description : 
*  The data structure is esentially an object of objects.
*  It consists of objects (with keys) - 'users' and 'channels'.
*  Both 'users' and 'channels' are arrays of objects with data on 
*  individual user information, and individual channel information 
*  respectively.
*
*  The following dataStore contains a sample entry of data.
*/

dataStore = {
    users : [
        {
            'uId': 71,
            'authUserId' : 1000,
            'tokens' : [1, 2, 3 ...],
            'nameFirst': 'SampleFirstName',
            'nameLast': 'SampleLastName',
            'email': 'sampleemail@email.com',
            'password' : 'P@$$1234',
            'handleStr': 'sampleUser11',
            'channels': [10],
            'dms' : [1, 2, 3],
            'isGlobalOwner': 1 || 2, //1 or 2 for global owner or not global owner respectivly
        },
        
    ],  
    channels : [
        {
            'channelId': 10,
            'name': 'sampleChannel',
            'isPublic' : false,
            'allMembers' : [71],
            'ownerMembers' : [1, 2, 3, 4, 5], //array of uder Id's
            'messages': [
                {
                'messageId' : 10,
                'uId' : 90,
                'timeSent' : 1332049834, //unix timestamp
                'message' : 'Hello World'
                },
            ]
        },
    ],
    dms : [
        {
            'dmId': 10,
            'name': 'sampleChannel',
            'allMembers' : [71],
            'owner' : 2, //user Id
            'messages': [
                {
                'messageId' : 10,
                'uId' : 90,
                'timeSent' : 1332049834, //unix timestamp
                'message' : 'Hello World'
                },
            ]
    }
    ]
}

```