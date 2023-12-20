const { LucyConnector } = require('./lucy-node-sdk');
const fetch = require('node-fetch');

// GET Customer Types
async function execute(payload) {
    const { command, parameters } = JSON.parse(payload);
    console.log(`Command is : ${command}`);
    console.log(`Parameters is : ${parameters}`);
    const { server, apikey, serviceCategoryKey, CCKey } = parameters;

    switch (command) {
        case 'GET_CUSTOMER_TYPES':
            return {
                data: await getCustomerTypes(server, apikey)
            }

        case 'GET_COMPLAINT_TYPES':
            return {
                data: await getComplaintTypes(server, apikey)
            }

        case 'GET_SUBCATEGORIES':
            return {
                data: await getSubcategories(server, apikey, serviceCategoryKey)
            }

        case 'GET_DEPARTMENTS':
            return {
                data: await getDepartments(server, apikey)
            }

        case 'GET_REGARDING_LIST':
            return {
                data: await getRegardingList(server, apikey)
            }

        case 'GET_COMPLAINT_LIST':
            return {
                data: await getComplaintList(server, apikey)
            }

        case 'GET_COMPLAINT_DETAILS':
            return {
                data: await getComplaintDetails(server, apikey, CCKey)
            }

        case 'CREATE_COMPLAINT':
            let { CCChannel, CCSCatKey, CTKey, CustomerComplaintTypeKey, DepttKey, Description, Email, LocationKey, Name, Phone, RegardingKey, Subject } = parameters;
            return {
                data: await createComplaint(server, apikey, CCChannel, CCSCatKey, CTKey, CustomerComplaintTypeKey, DepttKey, Description, Email, LocationKey, Name, Phone, RegardingKey, Subject)
            }
    }

}

const connector = LucyConnector.fromInstallationKey('https://plq.lucyday.io|SC:plq:bd9396d9127de79b|HS-Fxelle', 'Fxelle', execute);

connector.init()
    .then(_ => console.log("Initialized"))
    .catch(err => console.error(err))

//GET Customer types
async function getCustomerTypes(server, apiKey) {
    let response = await fetch(`${server}/PLQFeedback/CustomerTypes`, {
        method: 'GET',
        headers: {
            'Authorization': 'APIKEY ' + apiKey
        }
    });

    if (!response.ok) {
        throw (await response.text());
    }
    let json = await response.json();
    return json;
}

//GET Complaint Types
async function getComplaintTypes(server, apiKey) {
    let response = await fetch(`${server}/PLQFeedback/ComplaintTypes`, {
        method: 'GET',
        headers: {
            'Authorization': 'APIKEY ' + apiKey
        }
    });

    if (!response.ok) {
        throw (await response.text());
    }
    let json = await response.json();
    return json;
}

//GET Subcategories (GET) 
async function getSubcategories(server, apiKey, serviceCategoryKey) {
    let response = await fetch(`${server}/PLQFeedback/GetSubcategories/${serviceCategoryKey}`, {
        method: 'GET',
        headers: {
            'Authorization': 'APIKEY ' + apiKey
        }
    });

    if (!response.ok) {
        throw (await response.text());
    }
    let json = await response.json();
    return json;
}


//GET Departments
async function getDepartments(server, apiKey) {
    let response = await fetch(`${server}/PLQFeedback/GetDepartments`, {
        method: 'GET',
        headers: {
            'Authorization': 'APIKEY ' + apiKey
        }
    });

    if (!response.ok) {
        throw (await response.text());
    }
    let json = await response.json();
    return json;
}

//GET RegardingList
async function getRegardingList(server, apiKey) {
    let response = await fetch(`${server}/PLQFeedback/RegardingList`, {
        method: 'GET',
        headers: {
            'Authorization': 'APIKEY ' + apiKey
        }
    });

    if (!response.ok) {
        throw (await response.text());
    }
    let json = await response.json();
    return json;
}

//GET Complaint List
async function getComplaintList(server, apiKey) {
    let response = await fetch(`${server}/PLQFeedback/ListComplaint`, {
        method: 'GET',
        headers: {
            'Authorization': 'APIKEY ' + apiKey
        }
    });

    if (!response.ok) {
        console.log("Something went wrong");
        throw (await response.text());
    }
    let json = await response.json();
    return json;
}

//GET Complaint Details (GET) 
async function getComplaintDetails(server, apiKey, CCKey) {
    let response = await fetch(`${server}/PLQFeedback/ComplaintDetails/${CCKey}`, {
        method: 'GET',
        headers: {
            'Authorization': 'APIKEY ' + apiKey
        }
    });

    if (!response.ok) {
        throw (await response.text());
    }
    let json = await response.json();
    return json;
}

//Create a Complaint (POST) 
async function createComplaint(server, apiKey, CCChannel, CCSCatKey, CTKey, CustomerComplaintTypeKey, DepttKey, Description, Email, LocationKey, Name, Phone, RegardingKey, Subject) {
    const body = { CCChannel, CCSCatKey, CTKey, CustomerComplaintTypeKey, DepttKey, Description, Email, LocationKey, Name, Phone, RegardingKey, Subject };
    let response = await fetch(`${server}/PLQFeedback/CreateComplaint`, {
        method: 'POST',
        headers: {
            'Authorization': 'APIKEY ' + apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw (await response.text());
    }
    let json = await response.json();
    return json;
}