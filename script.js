/* ===========================================
   SUPABASE CONFIG
=========================================== */

const SUPABASE_URL = "https://rbdcbhpooihbbdehrjge.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZGNiaHBvb2loYmJkZWhyamdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODg3NzQsImV4cCI6MjEwMDQ2NDc3NH0.9n0CvpZzmx0mWNJNxdwimP3Z3Vi_a_1xLaAcNpptk5s";

/* ===========================================
   HEADERS
=========================================== */

const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json"
};

/* ===========================================
   API ENDPOINTS
=========================================== */

const ORDERS_API =
`${SUPABASE_URL}/rest/v1/orders?select=*`;

const USERS_API =
`${SUPABASE_URL}/rest/v1/users?select=*`;

const PRODUCTS_API =
`${SUPABASE_URL}/rest/v1/products?select=*`;

const DESTINATIONS_API =
`${SUPABASE_URL}/rest/v1/destinations?select=*`;

/* ===========================================
   GLOBAL DATA
=========================================== */

let orders = [];
let users = [];
let products = [];
let destinations = [];

let selectedDate = "";

/* ===========================================
   DATE FILTER
=========================================== */

function populateDateDropdown() {

    const dropdown = document.getElementById("dateFilter");

    dropdown.innerHTML = "";

    const dates = [...new Set(

        orders
            .filter(order => order.order_date_time)
            .map(order => order.order_date_time.substring(0,10))

    )];

    dates.sort((a, b) => new Date(b) - new Date(a));

    dates.forEach(date => {

        const option = document.createElement("option");

        option.value = date;

        option.textContent = new Date(date)
            .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

        dropdown.appendChild(option);

    });

    if (dates.length > 0) {

        selectedDate = dates[0];

        dropdown.value = selectedDate;

    }

    dropdown.addEventListener("change", () => {

        selectedDate = dropdown.value;

        updateDashboard();

    });

}

/* ===========================================
   FETCH TABLE (ALL ROWS)
=========================================== */

async function fetchTable(tableName) {

    let allData = [];

    let from = 0;

    const limit = 1000;

    while (true) {

        const response = await fetch(

            `${SUPABASE_URL}/rest/v1/${tableName}?select=*`,

            {
                headers: {
                    ...headers,
                    Range: `${from}-${from + limit - 1}`
                }
            }

        );

        if (!response.ok) {

            throw new Error(`Failed to fetch ${tableName}`);

        }

        const data = await response.json();

        allData.push(...data);

        console.log(`${tableName}: fetched ${data.length} rows`);

        if (data.length < limit) {

            break;

        }

        from += limit;

    }

    return allData;

}

/* ===========================================
   LOAD DATABASE
=========================================== */

async function loadDatabase() {

    try {

        [
            orders,
            users,
            products,
            destinations

        ] = await Promise.all([

            fetchTable("orders"),

            fetchTable("users"),

            fetchTable("products"),

            fetchTable("destinations")

        ]);

        console.log("Orders:", orders.length);
        console.log("Users:", users.length);
        console.log("Products:", products.length);
        console.log("Destinations:", destinations.length);

        populateDateDropdown();

        updateDashboard();

    }

    catch (error) {

        console.error("Database Error:", error);

    }

}

function getFilteredOrders() {

    if (!selectedDate)
        return orders;

    return orders.filter(order => {

        if (!order.order_date_time) return false;

        return order.order_date_time.substring(0,10) === selectedDate.substring(0,10);

    });

}

/* ===========================================
   UPDATE DASHBOARD
=========================================== */

function updateDashboard() {

    updateKPICards();

    updateLeaderboard();

    updateTopDestinations();

    createDailyChart();

    createMonthlyChart();

}

/* ==========================================================
   WALLET SUMMARY
========================================================== */


/* ===========================
   ELEMENTS
=========================== */

const walletOverlay =
    document.getElementById("walletOverlay");

const walletSummaryBtn =
    document.getElementById("walletSummaryBtn");

const walletClose =
    document.getElementById("walletClose");

const walletCloseBottom =
    document.getElementById("walletCloseBottom");


/* ===========================
   FORMATTERS
=========================== */

function walletMoney(value){

    return "$" + Number(value || 0).toLocaleString(
        undefined,
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );

}


function walletNumber(value){

    return Number(value || 0).toLocaleString();

}


function walletDate(date){

    return new Date(date).toLocaleDateString(
        "en-GB",
        {
            day:"2-digit",
            month:"long",
            year:"numeric"
        }
    );

}


function walletMonth(date){

    return new Date(date).toLocaleDateString(
        "en-GB",
        {
            month:"long",
            year:"numeric"
        }
    );

}


/* ===========================
   OPEN / CLOSE
=========================== */

function openWalletSummary(){

    if(!selectedDate){

        alert("Please select a date first.");

        return;

    }

    updateWalletSummary();

    walletOverlay.classList.add("show");

    document.body.style.overflow = "hidden";

}


function closeWalletSummary(){

    walletOverlay.classList.remove("show");

    document.body.style.overflow = "";

}


walletSummaryBtn.addEventListener(
    "click",
    openWalletSummary
);


walletClose.addEventListener(
    "click",
    closeWalletSummary
);


walletCloseBottom.addEventListener(
    "click",
    closeWalletSummary
);


walletOverlay.addEventListener(
    "click",
    event => {

        if(event.target === walletOverlay){

            closeWalletSummary();

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if(event.key === "Escape"){

            closeWalletSummary();

        }

    }
);


/* ===========================
   MAIN WALLET SUMMARY
=========================== */

function updateWalletSummary(){

    if(!selectedDate || !orders.length)
        return;


    const selected =
        new Date(selectedDate);


    const selectedYear =
        selected.getFullYear();


    const selectedMonth =
        selected.getMonth();


    const selectedDay =
        selected.getDate();


    /* ===========================
       DATE INFORMATION
    =========================== */

    document.getElementById(
        "walletPeriod"
    ).textContent =
        `${walletDate(selectedDate)} • ${walletMonth(selectedDate)}`;


    document.getElementById(
        "walletSubtitle"
    ).textContent =
        `Sales performance for ${walletDate(selectedDate)}`;


    /* ===========================
       SELECTED DAY
    =========================== */

    const dayOrders =
        orders.filter(order => {

            if(!order.order_date_time)
                return false;

            const date =
                new Date(order.order_date_time);

            return (

                date.getFullYear() === selectedYear &&
                date.getMonth() === selectedMonth &&
                date.getDate() === selectedDay

            );

        });


    /* ===========================
       CURRENT MONTH
    =========================== */

    const monthOrders =
        orders.filter(order => {

            if(!order.order_date_time)
                return false;

            const date =
                new Date(order.order_date_time);

            return (

                date.getFullYear() === selectedYear &&
                date.getMonth() === selectedMonth

            );

        });


    /* ===========================
       BASIC CALCULATIONS
    =========================== */

    const dayRevenue =
        dayOrders.reduce(
            (sum, order) =>
                sum + Number(order.amount || 0),
            0
        );


    const monthRevenue =
        monthOrders.reduce(
            (sum, order) =>
                sum + Number(order.amount || 0),
            0
        );


    const dayDiscount =
        dayOrders.reduce(
            (sum, order) =>
                sum + Number(order.discount_amount || 0),
            0
        );


    const monthDiscount =
        monthOrders.reduce(
            (sum, order) =>
                sum + Number(order.discount_amount || 0),
            0
        );


    const dayAverage =
        dayOrders.length
            ? dayRevenue / dayOrders.length
            : 0;


    const monthAverage =
        monthOrders.length
            ? monthRevenue / monthOrders.length
            : 0;


    /* ===========================
       UPDATE DAY STATS
    =========================== */

    document.getElementById(
        "walletDayOrders"
    ).textContent =
        walletNumber(dayOrders.length);


    document.getElementById(
        "walletDayRevenue"
    ).textContent =
        walletMoney(dayRevenue);


    document.getElementById(
        "walletDayAverage"
    ).textContent =
        walletMoney(dayAverage);


    document.getElementById(
        "walletDayDiscount"
    ).textContent =
        walletMoney(dayDiscount);


    /* ===========================
       UPDATE MONTH STATS
    =========================== */

    document.getElementById(
        "walletMonthOrders"
    ).textContent =
        walletNumber(monthOrders.length);


    document.getElementById(
        "walletMonthRevenue"
    ).textContent =
        walletMoney(monthRevenue);


    document.getElementById(
        "walletMonthAverage"
    ).textContent =
        walletMoney(monthAverage);


    document.getElementById(
        "walletMonthDiscount"
    ).textContent =
        walletMoney(monthDiscount);


    /* ===========================
       HIGHLIGHTS
    =========================== */

    updateWalletHighlights(
        monthOrders,
        dayOrders
    );


    /* ===========================
       SALESPEOPLE
    =========================== */

    updateWalletSalespeople(
        monthOrders
    );


    /* ===========================
       PRODUCTS
    =========================== */

    updateWalletProducts(
        monthOrders
    );


    /* ===========================
       DAILY BREAKDOWN
    =========================== */

    updateWalletDailyBreakdown(
        monthOrders,
        selectedDay
    );

}


/* ==========================================================
   HIGHLIGHTS
========================================================== */

function updateWalletHighlights(
    monthOrders,
    dayOrders
){

    /* ===========================
       TOP SALESPERSON
    =========================== */

    const salespersonMap = {};


    monthOrders.forEach(order => {

        const id = order.user_id;

        if(!id)
            return;


        if(!salespersonMap[id]){

            salespersonMap[id] = {

                orders:0,
                revenue:0

            };

        }


        salespersonMap[id].orders++;

        salespersonMap[id].revenue +=
            Number(order.amount || 0);

    });


    let topSalesperson = null;


    Object.entries(salespersonMap)
        .forEach(([id,data]) => {

            if(
                !topSalesperson ||
                data.revenue >
                topSalesperson.revenue
            ){

                topSalesperson = {

                    id,
                    ...data

                };

            }

        });


    if(topSalesperson){

        const user =
            users.find(
                u => u.user_id === topSalesperson.id
            );


        document.getElementById(
            "walletTopSalesperson"
        ).textContent =
            user
                ? user.name
                : topSalesperson.id;


        document.getElementById(
            "walletTopSalespersonValue"
        ).textContent =
            `${walletMoney(topSalesperson.revenue)} • ${topSalesperson.orders} orders`;

    }


    /* ===========================
       TOP PRODUCT
    =========================== */

    const productMap = {};


    monthOrders.forEach(order => {

        const id = order.product_id;

        if(!id)
            return;


        if(!productMap[id]){

            productMap[id] = {

                orders:0,
                revenue:0

            };

        }


        productMap[id].orders++;

        productMap[id].revenue +=
            Number(order.amount || 0);

    });


    let topProduct = null;


    Object.entries(productMap)
        .forEach(([id,data]) => {

            if(
                !topProduct ||
                data.revenue >
                topProduct.revenue
            ){

                topProduct = {

                    id,
                    ...data

                };

            }

        });


    if(topProduct){

        const product =
            products.find(
                p => p.prod_id === topProduct.id
            );


        const productName =
            product
                ? (
                    product.name ||
                    product.product_name ||
                    product.prod_name ||
                    product.prod_id
                )
                : topProduct.id;


        document.getElementById(
            "walletTopProduct"
        ).textContent =
            productName;


        document.getElementById(
            "walletTopProductValue"
        ).textContent =
            `${topProduct.orders} orders • ${walletMoney(topProduct.revenue)}`;

    }


    /* ===========================
       TOP DESTINATION
    =========================== */

    const destinationMap = {};


    monthOrders.forEach(order => {

        const product =
            products.find(
                p => p.prod_id === order.product_id
            );


        if(!product || !product.coverageDestinations)
            return;


        product.coverageDestinations
            .split(",")
            .map(code => code.trim())
            .forEach(code => {

                if(!destinationMap[code]){

                    destinationMap[code] = {

                        orders:0,
                        revenue:0

                    };

                }


                destinationMap[code].orders++;

                destinationMap[code].revenue +=
                    Number(order.amount || 0);

            });

    });


    let topDestination = null;


    Object.entries(destinationMap)
        .forEach(([id,data]) => {

            if(
                !topDestination ||
                data.orders >
                topDestination.orders
            ){

                topDestination = {

                    id,
                    ...data

                };

            }

        });


    if(topDestination){

        const destination =
            destinations.find(
                d =>
                    d.destination_id ===
                    topDestination.id
            );


        document.getElementById(
            "walletTopDestination"
        ).textContent =
            destination
                ? destination.destination_name
                : topDestination.id;


        document.getElementById(
            "walletTopDestinationValue"
        ).textContent =
            `${topDestination.orders} orders • ${walletMoney(topDestination.revenue)}`;

    }


    /* ===========================
       LARGEST ORDER
    =========================== */

    const largestOrder =
        monthOrders.reduce(
            (largest, order) => {

                if(
                    !largest ||
                    Number(order.amount || 0) >
                    Number(largest.amount || 0)
                ){

                    return order;

                }

                return largest;

            },
            null
        );


    if(largestOrder){

        document.getElementById(
            "walletLargestOrder"
        ).textContent =
            walletMoney(largestOrder.amount);


        document.getElementById(
            "walletLargestOrderNumber"
        ).textContent =
            largestOrder.order_no
                ? `Order #${largestOrder.order_no}`
                : "Largest transaction";

    }

}


/* ==========================================================
   SALESPEOPLE
========================================================== */

function updateWalletSalespeople(
    monthOrders
){

    const container =
        document.getElementById(
            "walletSalespeople"
        );


    const salespeople = {};


    monthOrders.forEach(order => {

        const id = order.user_id;

        if(!id)
            return;


        if(!salespeople[id]){

            salespeople[id] = {

                orders:0,
                revenue:0

            };

        }


        salespeople[id].orders++;

        salespeople[id].revenue +=
            Number(order.amount || 0);

    });


    const sorted =
        Object.entries(salespeople)
            .sort(
                (a,b) =>
                    b[1].revenue -
                    a[1].revenue
            )
            .slice(0,6);


    if(!sorted.length){

        container.innerHTML =
            `<p style="color:var(--text-light);font-size:.8rem;">
                No sales data available.
            </p>`;

        return;

    }


    const totalRevenue =
        monthOrders.reduce(
            (sum,order) =>
                sum + Number(order.amount || 0),
            0
        );


    container.innerHTML = "";


    sorted.forEach(
        ([id,data],index) => {

            const user =
                users.find(
                    u => u.user_id === id
                );


            const name =
                user
                    ? user.name
                    : id;


            const percentage =
                totalRevenue
                    ? (
                        data.revenue /
                        totalRevenue
                    ) * 100
                    : 0;


            container.innerHTML += `

                <div class="wallet-analysis-row">

                    <div class="wallet-analysis-name">

                        <div class="wallet-analysis-rank">
                            ${index + 1}
                        </div>

                        <span>
                            ${name}
                        </span>

                    </div>

                    <div class="wallet-analysis-value">

                        <strong>
                            ${walletMoney(data.revenue)}
                        </strong>

                        <small>
                            ${percentage.toFixed(1)}% • ${data.orders} orders
                        </small>

                    </div>

                </div>

            `;

        }
    );

}


/* ==========================================================
   PRODUCTS
========================================================== */

function updateWalletProducts(
    monthOrders
){

    const container =
        document.getElementById(
            "walletProducts"
        );


    const productMap = {};


    monthOrders.forEach(order => {

        const id = order.product_id;

        if(!id)
            return;


        if(!productMap[id]){

            productMap[id] = {

                orders:0,
                revenue:0

            };

        }


        productMap[id].orders++;

        productMap[id].revenue +=
            Number(order.amount || 0);

    });


    const sorted =
        Object.entries(productMap)
            .sort(
                (a,b) =>
                    b[1].revenue -
                    a[1].revenue
            )
            .slice(0,6);


    container.innerHTML = "";


    sorted.forEach(
        ([id,data],index) => {

            const product =
                products.find(
                    p => p.prod_id === id
                );


            const name =
                product
                    ? (
                        product.name ||
                        product.product_name ||
                        product.prod_name ||
                        product.prod_id
                    )
                    : id;


            container.innerHTML += `

                <div class="wallet-analysis-row">

                    <div class="wallet-analysis-name">

                        <div class="wallet-analysis-rank">
                            ${index + 1}
                        </div>

                        <span>
                            ${name}
                        </span>

                    </div>

                    <div class="wallet-analysis-value">

                        <strong>
                            ${walletMoney(data.revenue)}
                        </strong>

                        <small>
                            ${data.orders} orders
                        </small>

                    </div>

                </div>

            `;

        }
    );

}


/* ==========================================================
   DAILY BREAKDOWN
========================================================== */

function updateWalletDailyBreakdown(
    monthOrders,
    selectedDay
){

    const container =
        document.getElementById(
            "walletDailyBreakdown"
        );


    const daily = {};


    monthOrders.forEach(order => {

        const date =
            new Date(order.order_date_time);


        const day =
            date.getDate();


        if(!daily[day]){

            daily[day] = {

                orders:0,
                revenue:0

            };

        }


        daily[day].orders++;

        daily[day].revenue +=
            Number(order.amount || 0);

    });


    const sortedDays =
        Object.keys(daily)
            .sort(
                (a,b) =>
                    Number(a) -
                    Number(b)
            );


    container.innerHTML = "";


    sortedDays.forEach(day => {

        const data =
            daily[day];


        const selected =
            Number(day) === selectedDay;


        container.innerHTML += `

            <div class="
                wallet-day-item
                ${selected ? "selected" : ""}
            ">

                <span class="wallet-day-number">
                    ${day}
                </span>

                <strong class="wallet-day-revenue">
                    ${walletMoney(data.revenue)}
                </strong>

                <span class="wallet-day-orders">
                    ${data.orders} ${data.orders === 1 ? "order" : "orders"}
                </span>

            </div>

        `;

    });


    if(!sortedDays.length){

        container.innerHTML = `

            <div style="
                color:var(--text-light);
                font-size:.8rem;
                padding:10px 0;
            ">

                No sales recorded for this month.

            </div>

        `;

    }

}

/* ===========================================
   PLACEHOLDER FUNCTIONS
   (Will be completed in next parts)
=========================================== */

/* ===========================================
   KPI CARDS
=========================================== */

function updateKPICards() {

    const filteredOrders = getFilteredOrders();

    const validOrders = filteredOrders.filter(order => order.order_date_time);

    if (!validOrders.length) {

        document.getElementById("totalOrders").textContent = "0";
        document.getElementById("totalRevenue").textContent = "$0.00";

        document.getElementById("juneOrders").textContent = "0";
        document.getElementById("juneRevenue").textContent = "$0.00";

        document.getElementById("prevOrders").textContent = "0";
        document.getElementById("prevRevenue").textContent = "$0.00";

        document.getElementById("prevSameOrders").textContent = "0";
        document.getElementById("prevSameRevenue").textContent = "$0.00";

        return;

    }

    const selected = new Date(selectedDate);

    const currentMonth = selected.getMonth();
    const currentYear = selected.getFullYear();

    const previousMonth =
        currentMonth === 0 ? 11 : currentMonth - 1;

    const previousYear =
        currentMonth === 0
            ? currentYear - 1
            : currentYear;

    const selectedDay = selected.getDate();

    const totalOrders = validOrders.length;

    const totalRevenue = validOrders.reduce(

        (sum, order) => sum + Number(order.amount || 0),

        0

    );

    const currentOrders = orders.filter(order => {

        const d = new Date(order.order_date_time);

        return (

            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear

        );

    });

    const currentRevenue = currentOrders.reduce(

        (sum, order) => sum + Number(order.amount || 0),

        0

    );

    const previousOrders = orders.filter(order => {

        const d = new Date(order.order_date_time);

        return (

            d.getMonth() === previousMonth &&
            d.getFullYear() === previousYear

        );

    });

    const previousRevenue = previousOrders.reduce(

        (sum, order) => sum + Number(order.amount || 0),

        0

    );

    const previousSameDay = previousOrders.filter(order => {

        const d = new Date(order.order_date_time);

        return d.getDate() === selectedDay;

    });

    const previousSameRevenue = previousSameDay.reduce(

        (sum, order) => sum + Number(order.amount || 0),

        0

    );

    document.getElementById("totalOrders").textContent =
        totalOrders.toLocaleString();

    document.getElementById("totalRevenue").textContent =
        "$" + totalRevenue.toLocaleString(undefined, {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        });

    document.getElementById("juneOrders").textContent =
        currentOrders.length.toLocaleString();

    document.getElementById("juneRevenue").textContent =
        "$" + currentRevenue.toLocaleString(undefined, {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        });

    document.getElementById("prevOrders").textContent =
        previousOrders.length.toLocaleString();

    document.getElementById("prevRevenue").textContent =
        "$" + previousRevenue.toLocaleString(undefined, {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        });

    document.getElementById("prevSameOrders").textContent =
        previousSameDay.length.toLocaleString();

    document.getElementById("prevSameRevenue").textContent =
        "$" + previousSameRevenue.toLocaleString(undefined, {

            minimumFractionDigits:2,

            maximumFractionDigits:2

        });

}

/* ===========================================
   DAILY LEADERBOARD
=========================================== */

function updateLeaderboard() {

    const leaderboardBody =
        document.getElementById("leaderboardBody");

    leaderboardBody.innerHTML = "";

    const filteredOrders = getFilteredOrders();

    const leaderboard = users.map(user => {

        const userOrders = filteredOrders.filter(order =>
            order.user_id === user.user_id
        );

        const totalOrders = userOrders.length;

        const totalRevenue = userOrders.reduce(
            (sum, order) => sum + Number(order.amount || 0),
            0
        );

        const averageRevenue =
            totalOrders > 0
                ? totalRevenue / totalOrders
                : 0;

        return {

            name: user.name,

            orders: totalOrders,

            revenue: totalRevenue,

            average: averageRevenue

        };

    });

    leaderboard.sort((a, b) => b.revenue - a.revenue);

    leaderboard
        .filter(person => person.orders > 0)
        .slice(0, 10)
        .forEach((person, index) => {

            leaderboardBody.innerHTML += `

            <tr>

                <td>${index + 1}</td>

                <td>${person.name}</td>

                <td>${person.orders}</td>

                <td>$${person.revenue.toLocaleString()}</td>

                <td>$${person.average.toFixed(2)}</td>

                <td>

                    <span class="target">

                        Completed

                    </span>

                </td>

            </tr>

            `;

        });

}

/* ===========================================
   TOP DESTINATIONS
=========================================== */

function updateTopDestinations() {

    const container =
        document.getElementById("destinationList");

    container.innerHTML = "";

    const filteredOrders = getFilteredOrders();

    const destinationCount = {};

    filteredOrders.forEach(order => {

        const product = products.find(

    p => p.prod_id === order.product_id

    );

        if (!product) return;

        if (!product.coverageDestinations) return;

        product.coverageDestinations

            .split(",")

            .map(code => code.trim())

            .forEach(code => {

                destinationCount[code] =

                    (destinationCount[code] || 0) + 1;

            });

    });

    const sorted = Object.entries(destinationCount)

        .sort((a, b) => b[1] - a[1])

        .slice(0, 8);

    sorted.forEach(([code, count]) => {

        const destination = destinations.find(

            d => d.destination_id === code

        );

        const countryName =
            destination
                ? destination.destination_name
                : code;

        const flag =
            destination
                ? destination.flag_path
                : "";

        container.innerHTML += `

        <div class="destination-item">

            <div class="destination-left">

                <img
                    src="${flag}"
                    class="destination-flag"
                    alt="${countryName}"
                >

                <span class="destination-name">

                    ${countryName}

                </span>

            </div>

            <span class="destination-count">

                ${count}

            </span>

        </div>

        `;

    });

}

/* ===========================================
   DAILY CHART
=========================================== */

let dailyChart;

function createDailyChart() {

    if (!selectedDate) return;

    const selected = new Date(selectedDate);

    const monthOrders = orders.filter(order => {

        if (!order.order_date_time) return false;

        const d = new Date(order.order_date_time);

        return (
            d.getMonth() === selected.getMonth() &&
            d.getFullYear() === selected.getFullYear()
        );

    });

    const dailySales = {};

    monthOrders.forEach(order => {

        const day = new Date(order.order_date_time).getDate();

        dailySales[day] =
            (dailySales[day] || 0) + Number(order.amount || 0);

    });

    const labels = Object.keys(dailySales);

    const values = labels.map(day => dailySales[day]);

    if (dailyChart)
        dailyChart.destroy();

    dailyChart = new Chart(

        document.getElementById("dailyChart"),

        {

            type: "line",

            data: {

                labels,

                datasets: [{

                    label: "Daily Revenue",

                    data: values,

                    borderColor: "#744B93",

                    backgroundColor: "rgba(116,75,147,0.15)",

                    fill: true,

                    tension: .35

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }

    );

}

/* ===========================================
   MONTHLY CHART
=========================================== */

let monthlyChart;

function createMonthlyChart() {

    if (!selectedDate) return;

    const selected = new Date(selectedDate);

    const yearOrders = orders.filter(order => {

        if (!order.order_date_time) return false;

        return (
            new Date(order.order_date_time).getFullYear() ===
            selected.getFullYear()
        );

    });

    const monthlySales = {};

    yearOrders.forEach(order => {

        const month = new Date(order.order_date_time)
            .toLocaleString("default", {

                month: "short"

            });

        monthlySales[month] =
            (monthlySales[month] || 0) +
            Number(order.amount || 0);

    });

    const labels = Object.keys(monthlySales);

    const values = labels.map(month => monthlySales[month]);

    if (monthlyChart)
        monthlyChart.destroy();

    monthlyChart = new Chart(

        document.getElementById("monthlyChart"),

        {

            type: "bar",

            data: {

                labels,

                datasets: [{

                    label: "Monthly Revenue",

                    data: values,

                    backgroundColor: "#C889B5",

                    borderRadius: 8

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }

    );

}


/* ===========================================
   DOWNLOAD CSV
=========================================== */

function downloadCSV() {

    const filteredOrders = getFilteredOrders();

    if (!filteredOrders.length) {

        alert("No data available.");

        return;

    }

    const headers = [

        "Order No",

        "Order Date",

        "User ID",

        "Product ID",

        "Amount",

        "Discount"

    ];

    const rows = filteredOrders.map(order => [

        order.order_no,

        order.order_date_time,

        order.user_id,

        order.product_id,

        order.amount,

        order.discount_amount

    ]);

    const csv = [

        headers.join(","),

        ...rows.map(row => row.join(","))

    ].join("\n");

    const blob = new Blob(

        [csv],

        {

            type: "text/csv;charset=utf-8;"

        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `orders_${selectedDate}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

/* ===========================================
   BUTTON
=========================================== */

document
    .getElementById("downloadCSV")
    .addEventListener("click", downloadCSV);

/* ===========================================
   INITIALIZE
=========================================== */

window.addEventListener("DOMContentLoaded", () => {

    loadDatabase();

});