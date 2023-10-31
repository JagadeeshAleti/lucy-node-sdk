// GET Customer Types
export async function getCustomerTypes(server, apiKey, fields) {
    let response = await fetch(server + '/PLQFeedback/CustomerTypes?fields=' + fields, {
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
export async function getComplaintTypes(server, apiKey, fields) {
    let response = await fetch(server + 'PLQFeedback/ComplaintTypes?fields=' + fields, {
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
export async function getSubcategories(server, apiKey, serviceCategoryKey, fields) {
    let response = await fetch(server + `PLQFeedback/GetSubcategories/${serviceCategoryKey}?fields=` + fields, {
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
export async function getDepartments(server, apiKey, fields) {
    let response = await fetch(server + `PLQFeedback/GetDepartments?fields=` + fields, {
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
export async function getRegardingList(server, apiKey, fields) {
    let response = await fetch(server + `PLQFeedback/RegardingList?fields=` + fields, {
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
export async function getComplaintList(server, apiKey, fields) {
    let response = await fetch(server + `PLQFeedback/ListComplaint?fields=` + fields, {
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

//GET Complaint Details (GET) 
export async function getComplaintDetails(server, apiKey, CCKey, fields) {
    let response = await fetch(server + `PLQFeedback/ComplaintDetails/${CCKey}?fields=` + fields, {
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
export async function createComplaint(server, apiKey, body) {
    let response = await fetch(server + `PLQFeedback/CreateComplaint`, {
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