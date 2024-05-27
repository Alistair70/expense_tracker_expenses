/////////REDIRECT BUTTON FUNTIONALITY
document.getElementById("dashButton").addEventListener("click", function() {
    window.location.href = "https://dashboard.expense-tracker-demo.site";
});
document.getElementById("logout").addEventListener("click", function() {
    cookie_name = "expense_tracker_cookie_container"
    const now = new Date();
    const expirationTime = new Date(now.getTime() - 15 * 60 * 1000);
    document.cookie = `${cookie_name}=; domain=.expense-tracker-demo.site; expires=${expirationTime.toUTCString()}; path=/`;
    window.location.href = 'https://landing.expense-tracker-demo.site/';
});

encoded_id = getEncodedID_or_Landing()

// Request the expense types from the Python backend to populate the dropdown menu
var expenseTypeDropdown = document.getElementById("expenseType");

fetch('https://main-py-server.onrender.com/get_expense_types', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({encoded_id:encoded_id}),         
})
.then(response => response.json())
.then(data => {
    var option = document.createElement("option");
    option.text = "";
    expenseTypeDropdown.add(option);
    for(x in data.types)
    {            
        var option = document.createElement("option");
        option.text = data.types[x];
        expenseTypeDropdown.add(option);
    }         
});

document.addEventListener('DOMContentLoaded', function () {
    // Fetch and display elements from the server
    getExpenseTypes();
    getExpenseEntries();
});

// Function to get all the user's expense types and append each of them a HTML list with 
// a button to delete it if the user requests to do so.
function getExpenseTypes() {
    const expenseTypesList = document.getElementById('expenseTypesList');
    fetch('https://main-py-server.onrender.com/get_expense_types', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({encoded_id:encoded_id}),        
    })
    .then(response => response.json())
    .then(data => {
        
        for(x in data.types)
        {                    
            const li = document.createElement('li');
            li.textContent = data.types[x];
            type = data.types[x];
            li.dataset.id = data.types[x];
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('btn_remove');
            deleteButton.addEventListener('click', function () {
                remove_expense_type(type);
            });
            li.appendChild(deleteButton);
            expenseTypesList.appendChild(li);
        }         
    });
}

//Function that takes an INCOME TYPE and sends a request to delete it from the database
function remove_expense_type(expenseType) {
    fetch('https://main-py-server.onrender.com/remove_expense_type', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expenseTypeTBR:expenseType , encoded_id:encoded_id }), 
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success')
            getExpenseTypes();
    });
}

//////////ADD NEW EXPENSE FOR THE USER TO SQL DATABASE FUNCIONALITY
//VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV

// When the "Add Expense" button is clicked, it displays the respective form and hides all others.
document.getElementById("addExpenseBtn").addEventListener("click", function() {
    document.getElementById("expenseForm").style.display = "block";
    document.getElementById("addExpenseType").style.display = "none";
    document.getElementById("expenseEntries").style.display = "none";
});

// When "Confirm Expense" button is clicked the inputted values are validated  
// and if valid values are sent to be inserted into the respective database. 
document.getElementById("confirmExpenseBtn").addEventListener("click", function() {
    var expenseType = expenseTypeDropdown.value;
    var amount = document.getElementById("amount").value;
    var date = document.getElementById("userDate").value;


    if(expenseType == "" || amount == "" || date == "" || parseFloat(amount).toFixed(2) < 0)
    {
        document.getElementById("error").innerHTML = "Enter Missing/Valid Values";
    }
    else
    {
        saveExpenseToDatabase(expenseType, amount, date);
    }   
});

// Function to request the back-end to save to validated inputs from above and 
// saves them to the repesctive database.
function saveExpenseToDatabase(expenseType, amount, date) {    
    fetch('https://main-py-server.onrender.com/add_expense', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ expenseType: expenseType, amount: amount, date: date,encoded_id:encoded_id})
    })
    .then(response => response.json())
    .then(data => {
        if(data.message === 'success')
            location.reload();
    });
    
}

//////////CONFIRM NEW EXPENSE TYPE TO USER'S NOSQL DOCUMENT FUNCIONALITY
//VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV

//// Setion for adding new expense type. Eg. Groceires, Utilites, Tansporation, ect...
// When the "Add Expense Type" button is clicked, it displays the respective form and hides all others.
document.getElementById("addExpenseTypeBtn").addEventListener("click", function() {
    document.getElementById("expenseForm").style.display = "none";
    document.getElementById("addExpenseType").style.display = "block";
    document.getElementById("expenseEntries").style.display = "none";
});

// When "Confirm Expense Type" button is clicked the inputted values and if valid values are 
// sent to be inserted into the respective database. 
document.getElementById("confirmNewExpenseType").addEventListener("click", function() {
    var newExpenseTypeInput = document.getElementById("newExpense");    
    var newExpenseType = newExpenseTypeInput.value;
    if(newExpenseType == "")
    {
        document.getElementById("error").innerHTML = "Enter New Expense Type";
    }
    else
    {
        saveExpenseTypeToDatabase(newExpenseType);
    }   
});

// Function to request the back-end to save to validated inputs from above and 
// saves them to the repesctive database.
function saveExpenseTypeToDatabase(newExpenseType) {    
    fetch('https://main-py-server.onrender.com/add_expense_type', {
        method: 'POST',        
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newExpenseType: newExpenseType,encoded_id:encoded_id})
    })
    .then(response => response.json())
    .then(data => {
        if(data.message === 'exists')
            document.getElementById("message").innerHTML = "Income Type Already Exists";
        if(data.message === 'success')
            location.reload();
    });
}


//////////DELETE EXISTING EXPENSE ENTRIES FUNCIONALITY
//VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV

//// Section for retreiving currently saved expense entries
// When the "Edit Expense Entries" button is clicked, it displays the respective form and hides all others.
document.getElementById("editExpense").addEventListener("click", function() {
    document.getElementById("expenseForm").style.display = "none";
    document.getElementById("addExpenseType").style.display = "none";
    document.getElementById("expenseEntries").style.display = "block";
});

// Function to retrieve each of the user's recent expense entries and appends them to a HTML table 
// as well as button to delete it if the user reques to do so.
function getExpenseEntries() {
    const dataGrid = document.getElementById('dataGrid');
    fetch('https://main-py-server.onrender.com/get_recent_expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        
        body: JSON.stringify({encoded_id:encoded_id}),        
    })
    .then(response => response.json())
    .then(data => {
        
        const tbody = dataGrid.querySelector('tbody');
        tbody.innerHTML = '';
        for(x in data.entries)
        {   
            const row = document.createElement('tr');

            row.innerHTML = `
            <td>${data.entries[x]['expense_type']}</td>
            <td>${data.entries[x]['amount']}</td>
            <td>${data.entries[x]['date']}</td>
            <td><button class="delete-btn" onclick="deleteEntry(${data.entries[x]['expense_id']})">Delete</button></td>
            `;
            tbody.appendChild(row);          
        }         
    });
}

//Function that takes the ID of a singular expense entry and sends a request to delete it from the database
function deleteEntry(id) {
    fetch('https://main-py-server.onrender.com/delete_expense_entry', {        
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({expenseEntryTBR:id , encoded_id:encoded_id}) 
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === 'success')
            getExpenseEntries();
    })
    .catch(error => {
        console.error('Error:', error);
    });    
}

// Function used to set the date to today's date
function setTodayDate() {
    var dateInput = document.getElementById("userDate");
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    dateInput.value = today;
}

function getEncodedID_or_Landing() {
    const cookies = document.cookie.split(';');
    cookie_name = "expense_tracker_cookie_container"
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');

        if (name === cookie_name) {
            return value;
        }
    }
    window.location.href = 'https://landing.expense-tracker-demo.site/';
}