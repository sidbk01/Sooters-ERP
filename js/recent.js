let order_types;
let type_filter_active = false;
let selected_location = 0;

function on_load() {
    // Get the upcoming orders
    get(`/data/orders/recent`, (responseText) => {
        let orders = JSON.parse(responseText);
        get(`/data/customers`, (responseText) => {
            let customers = JSON.parse(responseText);
            get(`/data/order_types`, (responseText) => {
                order_types = JSON.parse(responseText);

                for (let order_type of order_types)
                    order_type.selected = true;

                display_recent(orders, order_types, customers);
            });
        }, load_error);
    }, load_error);

    // Get the locations
    get(`/data/locations`, (responseText) => {
        update_locations(JSON.parse(responseText))
    }, load_error)
}

function load_error() {
    alert("There was an error while loading the upcoming orders!")
}

function update_locations(locations) {
    let html = "<option value='0' selected>Any</option>";
    for (let location of locations)
        html += `<option value='${location.id}'>${location.name}</option>`;

    document.getElementById("location-filter").innerHTML = html;
}

function display_recent(orders, order_types, customers) {
    if (orders.length == 0) {
        document.getElementById("recent-orders").innerHTML = "<b>There are no recent orders</b>";
        return;
    }

    let html = "<table><thead>";
    html += "<tr><th>ID</th><th>Customer</th><th>Date Received</th><th id='type'>Type <img src='/images/filter' onclick='show_type_filter();' class='filter' /></th><th>Due Date</th><th>Status</th></tr></thead><tbody id='orders-body'>";

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

        let status_color = "red";
        let status = "Not Complete";
        if (order.date_complete) {
            status_color = "green";
            status = "Complete";
            if (order.picked_up) {
                status_color = "blue";
                status = "Picked Up";
            }
        }

        html += `<tr class="clickable" onclick="window.location.href = '/order?id=${order.id}&back=/orders/recent';">`;
        html += `<td>${order.formatted_id}<input type="hidden" class="location-id" value="${order.source_location}"/></td>`;
        html += `<td>${customer_name}</td>`;
        html += `<td>${order.date_received}</td>`;
        html += `<td>${order_type}<input type='hidden' value='${order.type}' /></td>`;
        html += `<td>${order.date_due}</td>`;
        html += `<td style='text-align: right'>${status}<span class="dot" style="background-color: ${status_color}"></span></td>`;
        html += "</tr>";
    }

    html += "</tbody></table>";

    document.getElementById("recent-orders").innerHTML = html;
}

function search() {
    // Get the search term
    let term = document.getElementById("search").value.toUpperCase();

    // Get the rows
    let body = document.getElementById("orders-body");
    if (!body)
        return;
    let rows = body.children;

    // Filter the results
    for (let row of rows) {
        // Check filters
        let filtered = false;
        let type = row.children[3].getElementsByTagName("input")[0].value;
        for (let order_type of order_types) {
            if (order_type.id == type) {
                if (!order_type.selected)
                    filtered = true;

                break;
            }
        }

        if (selected_location != 0) {
            let location = row.children[0].getElementsByTagName("input")[0].value;
            if (location != selected_location)
                filtered = true;
        }

        // Check search term
        let search_include = false;
        if (!filtered)
            for (let i = 0; i < row.children.length - 1; i++)
                search_include |= row.children[i].innerText.toUpperCase().indexOf(term) > -1;

        if (search_include && !filtered)
            row.style.display = "";
        else
            row.style.display = "none";
    }
}

window.addEventListener('click', (event) => {
    if (type_filter_active && !event.target.matches('#type'))
        hide_type_filter();
});

function hide_type_filter() {
    document.getElementById('type-filter-dropdown').remove();
    type_filter_active = false;
    let image_obj = document.getElementById('type').getElementsByTagName("img")[0];
    image_obj.onclick = show_type_filter;
    image_obj.classList.remove("filter-active")
}

function show_type_filter() {
    if (type_filter_active)
        return;

    type_filter_active = true;

    // Add the filter dropdown
    let html = `<div class='filter-dropdown' id='type-filter-dropdown'>`;
    html += `<h4>Select Types</h4>`;

    for (let order_type of order_types) {
        html += `<div>`;
        html += `<label for='order-type-${order_type.id}'>${order_type.name}</label> `;
        html += `<input id='order-type-${order_type.id}' onchange='adjust_filter(${order_type.id}, this.checked)' type='checkbox'${order_type.selected ? " checked" : ""} />`;
        html += `</div>`;
    }

    html += `</div>`;

    let type_obj = document.getElementById('type');
    type_obj.innerHTML = type_obj.innerHTML + html;
    type_obj.onclick = (event) => { event.stopPropagation() };

    let image_obj = type_obj.getElementsByTagName("img")[0];
    image_obj.onclick = hide_type_filter;
    image_obj.classList.add("filter-active");
}

function adjust_filter(order_type_id, selected) {
    for (let order_type of order_types) {
        if (order_type.id == order_type_id) {
            order_type.selected = selected;
            search();
            break;
        }
    }
}

function update_location_filter() {
    selected_location = document.getElementById("location-filter").value;
    search();
}