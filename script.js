var items = [
    {
        id: "L1001",
        type: "lost",
        reg_no: "202401",
        name: "Black Wallet",
        description: "Black leather wallet with a small silver logo.",
        category: "Accessories",
        location: "Central Library",
        date: "2026-08-28",
        status: "Open",
        image: ""
    },
    {
        id: "L1002",
        type: "lost",
        reg_no: "202315",
        name: "Wireless Earbuds",
        description: "White earbuds in a grey charging case.",
        category: "Electronics",
        location: "Block B - Lab 2",
        date: "2026-08-26",
        status: "Open",
        image: ""
    },
    {
        id: "F1003",
        type: "found",
        reg_no: "202422",
        name: "Student ID Card",
        description: "ID card found near the main canteen.",
        category: "Documents",
        location: "Main Canteen",
        date: "2026-08-30",
        status: "Pending Claim",
        image: ""
    },
    {
        id: "F1004",
        type: "found",
        reg_no: "202407",
        name: "Blue Backpack",
        description: "Navy blue backpack with two front pockets.",
        category: "Bags",
        location: "Sports Complex",
        date: "2026-08-29",
        status: "Open",
        image: ""
    },
    {
        id: "L1005",
        type: "lost",
        reg_no: "202318",
        name: "Room Keys",
        description: "Two keys on a plain metal key ring.",
        category: "Keys",
        location: "Block C",
        date: "2026-08-24",
        status: "Open",
        image: ""
    },
    {
        id: "F1006",
        type: "found",
        reg_no: "202431",
        name: "Engineering Book",
        description: "Engineering mathematics book with handwritten notes.",
        category: "Books",
        location: "Reading Room",
        date: "2026-08-27",
        status: "Open",
        image: ""
    }
];

var users = JSON.parse(localStorage.getItem("users")) || [];
var claims = JSON.parse(localStorage.getItem("claims")) || [];
var currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("claims", JSON.stringify(claims));
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

function showMessage(text) {
    var message = document.getElementById("message");
    message.innerHTML = text;
    message.className = "message show";

    setTimeout(function() {
        message.className = "message";
    }, 2500);
}

function updateNumbers() {
    var lost = 0;
    var found = 0;

    for (var i = 0; i < items.length; i++) {
        if (items[i].type == "lost") {
            lost++;
        } else {
            found++;
        }
    }

    document.getElementById("lostNumber").innerHTML = lost;
    document.getElementById("foundNumber").innerHTML = found;
    document.getElementById("claimNumber").innerHTML = claims.length;
}

function displayItems(list) {
    var itemBox = document.getElementById("items");
    itemBox.innerHTML = "";

    document.getElementById("resultNumber").innerHTML =
        list.length + (list.length == 1 ? " item" : " items");

    if (list.length == 0) {
        itemBox.innerHTML = "<p>No matching items found.</p>";
        return;
    }

    for (var i = 0; i < list.length; i++) {
        var item = list[i];

        var card = document.createElement("div");
        card.className = "item";

        var claimButton = "";

        if (item.type == "found" &&
            item.status != "Claimed" &&
            item.status != "Pending Claim") {
            claimButton =
                '<button class="button claim-button" onclick="startClaim(\'' +
                item.id + '\')">Claim this item</button>';
        }

        card.innerHTML =
            '<div class="item-image">' +
            (item.image ? item.image : "No image provided") +
            '</div>' +
            '<span class="badge ' + item.type + '">' + item.type + '</span>' +
            '<span class="badge ' + getStatusClass(item.status) + '">' +
            item.status + '</span>' +
            '<h3>' + item.name + '</h3>' +
            '<p>' + item.description + '</p>' +
            '<small>Location: ' + item.location + '</small>' +
            '<small>Date: ' + formatDate(item.date) + '</small>' +
            '<small>Category: ' + item.category + '</small>' +
            claimButton;

        itemBox.appendChild(card);
    }
}

function getStatusClass(status) {
    if (status == "Approved") return "approved";
    if (status == "Rejected") return "rejected";
    if (status == "Pending" || status == "Pending Claim") return "pending";
    return "";
}

function formatDate(date) {
    if (!date) return "";
    var d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-IN");
}

function searchItems() {
    var text = document.getElementById("searchText").value.toLowerCase();
    var type = document.getElementById("searchType").value;
    var category = document.getElementById("searchCategory").value;

    var result = [];

    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        var allText =
            item.name + " " +
            item.description + " " +
            item.location + " " +
            item.category;

        if ((text == "" || allText.toLowerCase().includes(text)) &&
            (type == "all" || item.type == type) &&
            (category == "all" || item.category == category)) {
            result.push(item);
        }
    }

    displayItems(result);
}

function clearSearch() {
    document.getElementById("searchText").value = "";
    document.getElementById("searchType").value = "all";
    document.getElementById("searchCategory").value = "all";
    displayItems(items);
}

function selectReportType(type) {
    document.getElementById("reportType").value = type;

    if (type == "lost") {
        document.getElementById("lostTab").className = "active-tab";
        document.getElementById("foundTab").className = "";
        document.getElementById("locationLabel").innerHTML = "Location Lost *";
        document.getElementById("dateLabel").innerHTML = "Date Lost *";
    } else {
        document.getElementById("foundTab").className = "active-tab";
        document.getElementById("lostTab").className = "";
        document.getElementById("locationLabel").innerHTML = "Location Found *";
        document.getElementById("dateLabel").innerHTML = "Date Found *";
    }
}

document.getElementById("reportForm").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!currentUser) {
        showMessage("Please login first.");
        openLogin();
        return;
    }

    var type = document.getElementById("reportType").value;

    var newItem = {
        id: type == "lost" ? "L" + Date.now() : "F" + Date.now(),
        type: type,
        reg_no: currentUser.reg_no,
        name: document.getElementById("itemName").value,
        description: document.getElementById("description").value,
        category: document.getElementById("itemCategory").value,
        location: document.getElementById("location").value,
        date: document.getElementById("itemDate").value,
        status: "Open",
        image: document.getElementById("image").value
    };

    items.unshift(newItem);

    document.getElementById("reportForm").reset();
    selectReportType(type);

    displayItems(items);
    updateNumbers();
    renderAdmin();

    showMessage("Report submitted successfully.");
});

function openLogin() {
    document.getElementById("loginModal").className = "modal show";
    showLogin();
}

function closeModal(id) {
    document.getElementById(id).className = "modal";
}

function showLogin() {
    document.getElementById("loginForm").className = "";
    document.getElementById("registerForm").className = "hidden";
    document.getElementById("loginTab").className = "active-modal-tab";
    document.getElementById("registerTab").className = "";
}

function showRegister() {
    document.getElementById("loginForm").className = "hidden";
    document.getElementById("registerForm").className = "";
    document.getElementById("registerTab").className = "active-modal-tab";
    document.getElementById("loginTab").className = "";
}

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;

    var foundUser = null;

    for (var i = 0; i < users.length; i++) {
        if (users[i].email == email && users[i].password == password) {
            foundUser = users[i];
        }
    }

    if (foundUser == null) {
        showMessage("Invalid email or password.");
        return;
    }

    currentUser = foundUser;
    saveData();
    closeModal("loginModal");
    updateLoginButton();
    renderClaims();
    showMessage("Login successful.");
});

document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    var email = document.getElementById("regEmail").value;

    for (var i = 0; i < users.length; i++) {
        if (users[i].email == email) {
            showMessage("Email already registered.");
            return;
        }
    }

    var user = {
        reg_no: document.getElementById("regNo").value,
        name: document.getElementById("regName").value,
        email: email,
        phone: document.getElementById("regPhone").value,
        password: document.getElementById("regPassword").value
    };

    users.push(user);
    currentUser = user;
    saveData();

    closeModal("loginModal");
    updateLoginButton();
    renderClaims();
    showMessage("Account created successfully.");
});

function updateLoginButton() {
    var button = document.getElementById("loginButton");

    if (currentUser) {
        button.innerHTML = "Logout";
        button.onclick = function() {
            currentUser = null;
            saveData();
            updateLoginButton();
            renderClaims();
            showMessage("Logged out.");
        };
    } else {
        button.innerHTML = "Login";
        button.onclick = openLogin;
    }
}

function startClaim(id) {
    if (!currentUser) {
        showMessage("Please login first.");
        openLogin();
        return;
    }

    var item = null;

    for (var i = 0; i < items.length; i++) {
        if (items[i].id == id) {
            item = items[i];
        }
    }

    document.getElementById("claimId").value = id;
    document.getElementById("claimItem").innerHTML =
        "Claiming: <b>" + item.name + "</b> - " + item.location;

    document.getElementById("claimModal").className = "modal show";
}

document.getElementById("claimForm").addEventListener("submit", function(event) {
    event.preventDefault();

    var claim = {
        claim_id: "C" + Date.now(),
        reg_no: currentUser.reg_no,
        item_id: document.getElementById("claimId").value,
        admin_id: null,
        proof: document.getElementById("claimProof").value,
        status: "Pending",
        claim_date: new Date().toISOString().slice(0, 10)
    };

    claims.push(claim);

    for (var i = 0; i < items.length; i++) {
        if (items[i].id == claim.item_id) {
            items[i].status = "Pending Claim";
        }
    }

    saveData();
    closeModal("claimModal");
    document.getElementById("claimForm").reset();

    displayItems(items);
    renderClaims();
    updateNumbers();
    renderAdmin();

    showMessage("Claim submitted for review.");
});

function renderClaims() {
    var box = document.getElementById("claimsList");

    if (!currentUser) {
        box.innerHTML = "<p>Please login to view your claims.</p>";
        return;
    }

    var myClaims = [];

    for (var i = 0; i < claims.length; i++) {
        if (claims[i].reg_no == currentUser.reg_no) {
            myClaims.push(claims[i]);
        }
    }

    if (myClaims.length == 0) {
        box.innerHTML = "<p>You have not submitted any claims.</p>";
        return;
    }

    box.innerHTML = "";

    for (var i = 0; i < myClaims.length; i++) {
        var claim = myClaims[i];
        var itemName = "Item";

        for (var j = 0; j < items.length; j++) {
            if (items[j].id == claim.item_id) {
                itemName = items[j].name;
            }
        }

        box.innerHTML +=
            '<div class="claim-row">' +
            '<b>' + itemName + '</b>' +
            '<span>' + claim.proof + '</span>' +
            '<span>' + claim.status + '</span>' +
            '</div>';
    }
}

function openAdmin() {
    document.getElementById("adminModal").className = "modal show";
    document.getElementById("adminLogin").className = "";
    document.getElementById("adminDashboard").className = "hidden";
}

document.getElementById("adminForm").addEventListener("submit", function(event) {
    event.preventDefault();

    var email = document.getElementById("adminEmail").value;
    var password = document.getElementById("adminPassword").value;

    if (email == "admin@campus.local" && password == "admin123") {
        document.getElementById("adminLogin").className = "hidden";
        document.getElementById("adminDashboard").className = "";
        renderAdmin();
    } else {
        showMessage("Invalid administrator login.");
    }
});

function renderAdmin() {
    var stats = document.getElementById("adminStats");
    var lost = 0;
    var found = 0;
    var pending = 0;

    for (var i = 0; i < items.length; i++) {
        if (items[i].type == "lost") lost++;
        if (items[i].type == "found") found++;
    }

    for (var i = 0; i < claims.length; i++) {
        if (claims[i].status == "Pending") pending++;
    }

    stats.innerHTML =
        '<div class="admin-stat"><b>' + users.length + '</b>Users</div>' +
        '<div class="admin-stat"><b>' + lost + '</b>Lost Reports</div>' +
        '<div class="admin-stat"><b>' + found + '</b>Found Reports</div>' +
        '<div class="admin-stat"><b>' + pending + '</b>Pending Claims</div>';

    var claimBox = document.getElementById("pendingClaims");
    claimBox.innerHTML = "";

    for (var i = 0; i < claims.length; i++) {
        if (claims[i].status == "Pending") {
            var claim = claims[i];

            var itemName = "Item";
            for (var j = 0; j < items.length; j++) {
                if (items[j].id == claim.item_id) {
                    itemName = items[j].name;
                }
            }

            claimBox.innerHTML +=
                '<div class="admin-claim">' +
                '<b>' + itemName + '</b>' +
                '<p>Registration No: ' + claim.reg_no + '</p>' +
                '<p>Proof: ' + claim.proof + '</p>' +
                '<div class="admin-actions">' +
                '<button class="approve-button" onclick="updateClaim(\'' +
                claim.claim_id + '\', \'Approved\')">Approve</button>' +
                '<button class="reject-button" onclick="updateClaim(\'' +
                claim.claim_id + '\', \'Rejected\')">Reject</button>' +
                '</div></div>';
        }
    }

    if (claimBox.innerHTML == "") {
        claimBox.innerHTML = "<p>No pending claims.</p>";
    }

    var reportBox = document.getElementById("adminReports");
    reportBox.innerHTML = "";

    for (var i = 0; i < items.length && i < 8; i++) {
        reportBox.innerHTML +=
            '<div class="admin-report">' +
            items[i].name + " - " + items[i].type +
            " - " + items[i].status +
            '</div>';
    }
}

function updateClaim(id, status) {
    for (var i = 0; i < claims.length; i++) {
        if (claims[i].claim_id == id) {
            claims[i].status = status;

            for (var j = 0; j < items.length; j++) {
                if (items[j].id == claims[i].item_id) {
                    if (status == "Approved") {
                        items[j].status = "Claimed";
                    } else {
                        items[j].status = "Open";
                    }
                }
            }
        }
    }

    saveData();
    renderAdmin();
    renderClaims();
    displayItems(items);
    updateNumbers();

    showMessage("Claim " + status.toLowerCase() + ".");
}

function resetData() {
    users = [];
    claims = [];
    currentUser = null;

    saveData();
    displayItems(items);
    renderClaims();
    renderAdmin();
    updateNumbers();
    updateLoginButton();

    showMessage("Demo data reset.");
}

displayItems(items);
renderClaims();
updateNumbers();
updateLoginButton();
