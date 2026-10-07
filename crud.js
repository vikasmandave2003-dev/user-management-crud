let userForm = document.querySelector("#userForm");

let fullName = document.querySelector("#fullName");
let email = document.querySelector("#email");
let mobile = document.querySelector("#mobile");
let role = document.querySelector("#role");
let status = document.querySelector("#status");
let editUserId = null;
let deleteUserId = null;

// Get error elements
let fullNameError = document.querySelector("#fullNameError");
let emailError = document.querySelector("#emailError");
let mobileError = document.querySelector("#mobileError");
let roleError = document.querySelector("#roleError");

// Form submit
userForm.addEventListener("submit", function (event) {
    event.preventDefault();
    fullNameError.innerHTML = "";
    emailError.innerHTML = "";
    mobileError.innerHTML = "";
    roleError.innerHTML = "";


    let nameValue = fullName.value.trim();
    let emailValue = email.value.trim();
    let mobileValue = mobile.value.trim();
    let roleValue = role.value;

    let isValid = true;

    // fullName - validation
    if (nameValue === "") {
        fullNameError.innerHTML = "Full Name is required";
        isValid = false;
    }
    else if (nameValue.length < 3 || nameValue.length > 50) {
        fullNameError.innerHTML = "Name must be between 3 and 50 characters";
        isValid = false;
    }

    // email-validation
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailValue === "") {
        emailError.innerHTML = "Email is required";
        isValid = false;
    }
    else if (!emailPattern.test(emailValue)) {
        emailError.innerHTML = "Enter a valid email address";
        isValid = false;
    }

    //mobile-validation
    let mobilePattern = /^[6-9][0-9]{9}$/;

    if (mobileValue === "") {
        mobileError.innerHTML = "Mobile is required";
        isValid = false;
    }
    else if (!mobilePattern.test(mobileValue)) {
        mobileError.innerHTML = "Enter a valid 10-digit mobile number";
        isValid = false;
    }
    //role-validation
    if (roleValue === "") {
        roleError.innerHTML = "Please select a role";
        isValid = false;
    }


    if (!isValid) {
        return;
    }


    let users = JSON.parse(localStorage.getItem("users")) || [];

    //check-duplicate email
    let emailExists = users.some(function (user) {
        return (user.email.toLowerCase() === emailValue.toLowerCase() && user.id !== editUserId);
    });

    if (emailExists) {
        emailError.innerHTML = "This email already exists";
        return;
    }

    // updateuser
    if (editUserId !== null) {
        users = users.map(function (user) {
            if (user.id === editUserId) {
                return {
                    ...user,
                    fullName: nameValue,
                    email: emailValue,
                    mobile: mobileValue,
                    role: roleValue,
                    status: status.checked,

                    editedBy: "Admin",
                    editedDate: new Date().toISOString()
                };
            }
            return user;
        });

        localStorage.setItem("users", JSON.stringify(users));

        editUserId = null;
        showToast("User updated successfully");
    }
    else {
        //create-new user
        let currentTime = new Date().toISOString();

        let newUser = {
            id: Date.now(),
            fullName: nameValue,
            email: emailValue,
            mobile: mobileValue,
            role: roleValue,
            status: status.checked,

            createdBy: "Admin",
            createdDate: currentTime,

            editedBy: null,
            editedDate: null
        };
        users.push(newUser);

        localStorage.setItem("users", JSON.stringify(users));

        showToast("User added successfully");

    }

    userForm.reset();

    status.checked = true;

    // Close modal
    let modalElement = document.querySelector("#userModal");
    let modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();

    displayUsers();
})

let userTableBody = document.querySelector("#userTableBody");
let searchInput = document.querySelector("#searchInput");
let roleFilter = document.querySelector("#roleFilter");
let statusFilter = document.querySelector("#statusFilter");
let sortFilter = document.querySelector("#sortFilter");
let pagination = document.querySelector("#pagination");
let currentPage = 1;
let usersPerPage = 5;

function displayUsers() {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    // Add date to old users
    users.forEach(function (user) {
        if (!user.createdDate) {
            user.createdDate = new Date().toISOString();
        }
    });

    localStorage.setItem("users", JSON.stringify(users));

    let searchValue = searchInput.value.toLowerCase().trim();

    // Search users
    users = users.filter(function (user) {
        return (
            user.fullName.toLowerCase().includes(searchValue) ||
            user.email.toLowerCase().includes(searchValue) ||
            user.mobile.includes(searchValue)
        );
    });

    //role  and status code
    let selectedRole = roleFilter.value;
    let selectedStatus = statusFilter.value;
    users = users.filter(function (user) {
        let roleMatch =
            selectedRole === "" ||
            user.role === selectedRole;

        let statusMatch =
            selectedStatus === "" ||
            String(user.status) === selectedStatus;
        return roleMatch && statusMatch;

    });

    //sorting
    let sortValue = sortFilter.value;
    if (sortValue === "nameAsc") {
        users.sort(function (a, b) {
            return a.fullName.localeCompare(b.fullName);
        });
    }
    else if (sortValue === "nameDesc") {
        users.sort(function (a, b) {
            return b.fullName.localeCompare(a.fullName);
        });
    }
    else if (sortValue === "dateAsc") {
        users.sort(function (a, b) {
            return new Date(a.createdDate) - new Date(b.createdDate);
        });
    }
    else if (sortValue === "dateDesc") {
        users.sort(function (a, b) {
            return new Date(b.createdDate) - new Date(a.createdDate);
        });
    }

    //pagination
    let totalPages = Math.ceil(users.length / usersPerPage);
    let startIndex = (currentPage - 1) * usersPerPage;
    let endIndex = startIndex + usersPerPage;
    let paginatedUsers = users.slice(startIndex, endIndex);

    userTableBody.innerHTML = "";

    if (users.length === 0) {
        userTableBody.innerHTML = `<tr> <td colspan="10" class="text-center"> No users found </td> </tr>`;
        return;
    }

    //display every user
    paginatedUsers.forEach(function (user) {
        let row = document.createElement("tr");
        row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.fullName}</td>       
        <td>${user.email}</td> 
        <td>${user.mobile}</td> 
        <td>${user.role}</td>
        <td>
         ${user.status ? '<span class="badge bg-success">Active</span>'
                : '<span class="badge bg-secondary">Inactive</span>'
            } 
        </td>
        <td>${new Date(user.createdDate).toLocaleString("en-IN")}</td>
       <td>
    <small>
        <strong>Created By:</strong> ${user.createdBy || "Admin"}
    </small>
    <br>

    <small>
        <strong>Created:</strong>
        ${new Date(user.createdDate).toLocaleString("en-IN")}
    </small>

    <br><br>

    <small>
        <strong>Edited By:</strong>
        ${user.editedBy || "Not edited"}
    </small>

    ${user.editedDate
                ? `<br>
               <small>
                   <strong>Edited:</strong>
                   ${new Date(user.editedDate).toLocaleString("en-IN")}
               </small>`
                : ""
            }
</td>
        <td>
            <input type="checkbox" class="user-checkbox" data-id="${user.id}">
        </td>
        <td>
        <button class="btn btn-sm btn-warning edit-btn" data-id="${user.id}"> Edit </button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}"> Delete </button>
        </td>
        `;
        userTableBody.appendChild(row);
    });

    displayPagination(totalPages);
    updateStats();

    // Edit buttons
    let editButtons = document.querySelectorAll(".edit-btn");
    editButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            let userId = Number(button.getAttribute("data-id"));
            editUser(userId);
        });
    });

    // Delete buttons
    let deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            let userId = Number(button.getAttribute("data-id"));

            deleteUserId = userId;

            let deleteModalElement = document.querySelector("#deleteModal");

            let deleteModal = bootstrap.Modal.getOrCreateInstance(
                deleteModalElement
            );
            deleteModal.show();
        });

    });

}
displayUsers();

function updateStats() {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    let totalUsers = users.length;

    // Active users
    let activeUsers = users.filter(function (user) {
        return user.status === true;
    }).length;

    // Inactive users
    let inactiveUsers = users.filter(function (user) {
        return user.status === false;
    }).length;

    // Admin users
    let adminUsers = users.filter(function (user) {
        return user.role === "Admin";
    }).length;

    // Show data in cards
    document.querySelector("#totalUsers").textContent = totalUsers;
    document.querySelector("#activeUsers").textContent = activeUsers;
    document.querySelector("#inactiveUsers").textContent = inactiveUsers;
    document.querySelector("#adminUsers").textContent = adminUsers;
}

// Edit User
function editUser(userId) {

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Find user
    let user = users.find(function (item) {
        return item.id === userId;
    });

    if (!user) {
        return;
    }

    // Store user ID
    editUserId = userId;

    // Fill form
    fullName.value = user.fullName;
    email.value = user.email;
    mobile.value = user.mobile;
    role.value = user.role;
    status.checked = user.status;

    fullNameError.innerHTML = "";
    emailError.innerHTML = "";
    mobileError.innerHTML = "";
    roleError.innerHTML = "";

    let modalElement = document.querySelector("#userModal");

    let modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    modal.show();
}

//Delete button
let confirmDelete = document.querySelector("#confirmDelete");
confirmDelete.addEventListener("click", function () {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Remove selected user
    users = users.filter(function (user) {
        return user.id !== deleteUserId;
    });

    // Save updated users
    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

    showToast("User deleted successfully");

    // Reset delete ID
    deleteUserId = null;

    let deleteModalElement = document.querySelector("#deleteModal");
    let deleteModal = bootstrap.Modal.getInstance(deleteModalElement);

    deleteModal.hide();
    displayUsers();
});

function showToast(message) {
    let toastMessage = document.querySelector("#toastMessage");
    toastMessage.innerHTML = message;
    let toastElement = document.querySelector("#userToast");
    let toast = bootstrap.Toast.getOrCreateInstance(toastElement);
    toast.show();
}

//pagination function
function displayPagination(totalPages) {
    pagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    // Previous button
    let previousItem = document.createElement("li");
    previousItem.className = "page-item";
    previousItem.innerHTML = `<button class="page-link">Previous</button>`;

    previousItem.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            displayUsers();
        }
    });
    pagination.appendChild(previousItem);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        let pageItem = document.createElement("li");
        pageItem.className = "page-item";

        if (i === currentPage) {
            pageItem.classList.add("active");
        }
        pageItem.innerHTML = `<button class="page-link">${i}</button>`;

        pageItem.addEventListener("click", function () {
            currentPage = i;
            displayUsers();
        });

        pagination.appendChild(pageItem);
    }

    // Next button
    let nextItem = document.createElement("li");
    nextItem.className = "page-item";
    nextItem.innerHTML = `<button class="page-link">Next</button>`;

    nextItem.addEventListener("click", function () {
        if (currentPage < totalPages) {
            currentPage++;
            displayUsers();
        }
    });

    pagination.appendChild(nextItem);
}

//select check box
let selectAll = document.querySelector("#selectAll");

selectAll.addEventListener("change", function () {
    let checkboxes = document.querySelectorAll(".user-checkbox");
    checkboxes.forEach(function (checkbox) {
        checkbox.checked = selectAll.checked;
    });
});

let deleteSelected = document.querySelector("#deleteSelected");
deleteSelected.addEventListener("click", function () {

    let checkboxes = document.querySelectorAll(".user-checkbox:checked");
    if (checkboxes.length === 0) {
        alert("Please select at least one user.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let selectedIds = [];

    checkboxes.forEach(function (checkbox) {
        selectedIds.push(Number(checkbox.dataset.id));
    });

    users = users.filter(function (user) {
        return !selectedIds.includes(user.id);
    });

    localStorage.setItem("users", JSON.stringify(users));
    selectAll.checked = false;
    displayUsers();
});

//Search
searchInput.addEventListener("input", function () {
    currentPage = 1;
    displayUsers();
});

//role filter
roleFilter.addEventListener("change", function () {
    currentPage = 1;
    displayUsers();
});

//status filter
statusFilter.addEventListener("change", function () {
    currentPage = 1;
    displayUsers();
});

//sort filter
sortFilter.addEventListener("change", function () {
    currentPage = 1;
    displayUsers();
});

// Bulk Edit
let bulkEdit = document.querySelector("#bulkEdit");
let bulkEditTableBody = document.querySelector("#bulkEditTableBody");
let saveBulkEdit = document.querySelector("#saveBulkEdit");

bulkEdit.addEventListener("click", function () {
    let checkboxes = document.querySelectorAll(".user-checkbox:checked");

    if (checkboxes.length === 0) {
        alert("Please select at least one user.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    bulkEditTableBody.innerHTML = "";
    checkboxes.forEach(function (checkbox) {
        let userId = Number(checkbox.dataset.id);
        let user = users.find(function (item) {
            return item.id === userId;
        });

        if (!user) {
            return;
        }

        let row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <input type="text"
                    class="form-control bulk-name"
                    data-id="${user.id}"
                    value="${user.fullName}">
            </td>

            <td>
                <input type="email"
                    class="form-control bulk-email"
                    data-id="${user.id}"
                    value="${user.email}">
            </td>

            <td>
                <input type="text"
                    class="form-control bulk-mobile"
                    data-id="${user.id}"
                    value="${user.mobile}">
            </td>

            <td>
                <select class="form-select bulk-role"
                    data-id="${user.id}">
                    <option value="Admin" ${user.role === "Admin" ? "selected" : ""}>
                        Admin
                    </option>
                    <option value="Manager" ${user.role === "Manager" ? "selected" : ""}>
                        Manager
                    </option>
                    <option value="Staff" ${user.role === "Staff" ? "selected" : ""}>
                        Staff
                    </option>
                </select>
            </td>

            <td>
                <select class="form-select bulk-status"
                    data-id="${user.id}">
                    <option value="true" ${user.status === true ? "selected" : ""}>
                        Active
                    </option>
                    <option value="false" ${user.status === false ? "selected" : ""}>
                        Inactive
                    </option>
                </select>
            </td>
        `;

        bulkEditTableBody.appendChild(row);
    });

    let bulkEditModalElement = document.querySelector("#bulkEditModal");
    let bulkEditModal = bootstrap.Modal.getOrCreateInstance(
        bulkEditModalElement
    );
    bulkEditModal.show();
});


saveBulkEdit.addEventListener("click", function () {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    let names = document.querySelectorAll(".bulk-name");
    let emails = document.querySelectorAll(".bulk-email");
    let mobiles = document.querySelectorAll(".bulk-mobile");
    let roles = document.querySelectorAll(".bulk-role");
    let statuses = document.querySelectorAll(".bulk-status");

    let editedUsers = [];

    for (let i = 0; i < names.length; i++) {
        let nameValue = names[i].value.trim();
        let emailValue = emails[i].value.trim();
        let mobileValue = mobiles[i].value.trim();
        let roleValue = roles[i].value;
        let statusValue = statuses[i].value === "true";

        // Full Name validation
        if (nameValue.length < 3 || nameValue.length > 50) {
            alert("Full Name must be between 3 and 50 characters.");
            return;
        }

        // Email validation
        let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailValue)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Mobile validation
        let mobilePattern = /^[0-9]{10}$/;
        if (!mobilePattern.test(mobileValue)) {
            alert("Mobile must contain exactly 10 digits.");
            return;
        }

        if (roleValue === "") {
            alert("Please select a role.");
            return;
        }

        editedUsers.push({
            id: Number(names[i].dataset.id),
            fullName: nameValue,
            email: emailValue.toLowerCase(),
            mobile: mobileValue,
            role: roleValue,
            status: statusValue
        });
    }

    // Check duplicate emails
    let emailList = editedUsers.map(function (user) {
        return user.email;
    });

    let duplicateEmail = emailList.some(function (email, index) {
        return emailList.indexOf(email) !== index;
    });

    if (duplicateEmail) {
        alert("Email must be unique for every user.");
        return;
    }

    // Check email with other existing users
    let emailExists = editedUsers.some(function (editedUser) {

        return users.some(function (user) {
            return user.email.toLowerCase() === editedUser.email &&
                user.id !== editedUser.id &&
                !editedUsers.some(function (item) {
                    return item.id === user.id;
                });
        });

    });

    if (emailExists) {
        alert("One of these emails already exists.");
        return;
    }

    // Update users
    users = users.map(function (user) {
        let editedUser = editedUsers.find(function (item) {
            return item.id === user.id;
        });

        if (!editedUser) {
            return user;
        }

        return {
            ...user,
            fullName: editedUser.fullName,
            email: editedUser.email,
            mobile: editedUser.mobile,
            role: editedUser.role,
            status: editedUser.status,

            editedBy: "Admin",
            editedDate: new Date().toISOString()
        };
    });

    localStorage.setItem("users", JSON.stringify(users));
    showToast("Selected users updated successfully");

    let bulkEditModalElement = document.querySelector("#bulkEditModal");
    let bulkEditModal = bootstrap.Modal.getInstance(
        bulkEditModalElement
    );

    bulkEditModal.hide();
    selectAll.checked = false;
    displayUsers();
});


