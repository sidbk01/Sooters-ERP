function on_load() {
    // Get the upcoming orders
    get(`/data/orders/recent`, (responseText) => {
        let orders = JSON.parse(responseText);
        get(`/data/customers`, (responseText) => {
            let customers = JSON.parse(responseText);
            get(`/data/order_types`, (responseText) => {
                let order_types = JSON.parse(responseText);
                display_recent(orders, order_types, customers);
            });
        }, load_error);
    }, load_error);
}

function load_error() {
    alert("There was an error while loading the upcoming orders!")
}

function display_recent(orders, order_types, customers) {
    if (orders.length == 0) {
        document.getElementById("recent-orders").innerHTML = "<b>There are no recent orders</b>";
        return;
    }

    let html = "<table><thead>";
    html += "<tr><th>ID</th><th>Customer</th><th>Date Received</th><th>Type</th><th>Due Date</th></tr></thead><tbody id='orders-body'>";

    for (let order of orders) {
        let order_type;
        for (let type of order_types) {
            if (type.id == order.type) {
                order_type = type.name;
                break;
            }
        }

        let customer_name;
        for (let customer of customers) {
            if (customer.id == order.customer) {
                customer_name = customer.name;
                break;
            }
        }

        html += `<tr class="clickable" onclick="window.location.href = '/order?id=${order.id}&back=/orders/recent';">`;
        html += `<td>${order.formatted_id}</td>`;
        html += `<td>${customer_name}</td>`;
        html += `<td>${order.date_received}</td>`;
        html += `<td>${order_type}</td>`;
        html += `<td>${order.date_due}</td>`;
        html += "</tr>";
        // TODO: Add status
        //      Adjust search below to not search status
    }

    html += "</tbody></table>";

    document.getElementById("recent-orders").innerHTML = html;
}


function search() {
    // Get the search term
    let term = document.getElementById("search").value.toUpperCase();

    // Filter the results
    let rows = document.getElementById("orders-body").children;
    for (let row of rows) {
        let include = false;

        for (let i = 0; i < row.children.length; i++)
            include |= row.children[i].innerText.toUpperCase().indexOf(term) > -1;

        if (include)
            row.style.display = "";
        else
            row.style.display = "none";
    }
}