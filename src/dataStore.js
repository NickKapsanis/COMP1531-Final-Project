// YOU SHOULD MODIFY THIS OBJECT BELOW
let data = {
  users : [
    { 
        'uid': 1,
        'authUserId': 1000,
        'nameFirst': 'SampleFirstName',
        'nameLast': 'SampleLastName',
        'email': 'sampleemail@email.com',
        'password' : 'P@$$1234',
        'handleStr': 'sampleUser11',
        'channels': [10],
    },
    
  ],  
  channels : [
    {
        'channelId': 10,
        'name': 'sampleChannel',
        'isPublic' : false,
        'allMembers' : [71],
        'ownerMembers' : [1, 2, 3, 4, 5], //array of user Id's
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
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

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
function setData(newData) {
  data = newData;
}

export { getData, setData };
