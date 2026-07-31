function showToast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerHTML = message;

    if (type === "error")
        toast.style.background = "#ef4444";

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 50);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 2500);

}
function animateCurrency(id, end, duration) {

    const obj = document.getElementById(id);

    let startTime = null;

    function animation(currentTime) {

        if (!startTime)
            startTime = currentTime;

        const progress = Math.min(
            (currentTime - startTime) / duration,
            1
        );

        const value = Math.floor(progress * end);

        obj.innerText =
            "₹ " + value.toLocaleString();

        if (progress < 1)
            requestAnimationFrame(animation);

    }

    requestAnimationFrame(animation);

}
function animateValue(id, start, end, duration) {

    const obj = document.getElementById(id);

    let startTime = null;

    function animation(currentTime) {

        if (!startTime)
            startTime = currentTime;

        const progress = Math.min(
            (currentTime - startTime) / duration,
            1
        );

        obj.innerText = Math.floor(
            progress * (end - start) + start
        ).toLocaleString();

        if (progress < 1)
            requestAnimationFrame(animation);

    }

    requestAnimationFrame(animation);

}
async function loadDashboard() {

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/dashboard_summary`,
            {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();

        animateValue(
            "todayOrders",
            0,
            Number(data.todayOrders),
            1200
        );

        animateCurrency(
            "todayRevenue",
            Number(data.todayRevenue),
            1200
        );

        animateValue(
            "monthlyOrders",
            0,
            Number(data.monthlyOrders),
            1400
        );

        animateCurrency(
            "monthlyRevenue",
            Number(data.monthlyRevenue),
            1400
        );

        document.querySelectorAll(".card").forEach((card, index) => {

            card.animate(
                [
                    {
                        opacity: 0,
                        transform: "translateY(35px)"
                    },
                    {
                        opacity: 1,
                        transform: "translateY(0)"
                    }
                ],
                {
                    duration: 600,
                    delay: index * 120,
                    easing: "ease-out",
                    fill: "forwards"
                }
            );

        });

    } catch (err) {

        console.error(err);

        showToast("Unable to load dashboard", "error");

    }

}
async function loadLeaderboard() {

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/leaderboard`,
            {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();

        const tbody = document.getElementById("leaderboardBody");

        tbody.innerHTML = "";

        data.forEach((user, index) => {

            let medal = "";

            switch (index) {

                case 0:
                    medal = "🥇";
                    break;

                case 1:
                    medal = "🥈";
                    break;

                case 2:
                    medal = "🥉";
                    break;

                default:
                    medal = `<span style="
                        display:inline-flex;
                        width:28px;
                        height:28px;
                        align-items:center;
                        justify-content:center;
                        border-radius:50%;
                        background:rgba(255,255,255,.08);
                        color:#fff;
                        font-size:13px;
                        font-weight:700;
                    ">${index + 1}</span>`;
            }

            const row = document.createElement("tr");

            row.style.opacity = "0";
            row.style.transform = "translateY(20px)";

            row.innerHTML = `
                <td>
                    <div style="display:flex;align-items:center;gap:12px;">
                        ${medal}
                        <strong>${user.name}</strong>
                    </div>
                </td>

                <td>
                    <span style="
                        background:rgba(59,130,246,.18);
                        color:#60a5fa;
                        padding:6px 14px;
                        border-radius:999px;
                        font-weight:600;
                    ">
                        ${Number(user.orders).toLocaleString()}
                    </span>
                </td>

                <td style="font-weight:700;color:#22c55e;">
                    ₹ ${Number(user.revenue).toLocaleString()}
                </td>
            `;

            tbody.appendChild(row);

            row.animate(
                [
                    {
                        opacity: 0,
                        transform: "translateY(20px)"
                    },
                    {
                        opacity: 1,
                        transform: "translateY(0)"
                    }
                ],
                {
                    duration: 500,
                    delay: index * 120,
                    easing: "ease-out",
                    fill: "forwards"
                }
            );

        });

        showToast("Leaderboard Updated");

    } catch (err) {

        console.error(err);

        showToast("Unable to load leaderboard", "error");

    }

}
async function loadDestinations() {

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/top_destinations`,
            {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();

        const list = document.getElementById("destinationList");

        list.innerHTML = "";

        // Country Flag Map
        const flags = {
            "India":"🇮🇳",
            "Japan":"🇯🇵",
            "Thailand":"🇹🇭",
            "Singapore":"🇸🇬",
            "Dubai":"🇦🇪",
            "UAE":"🇦🇪",
            "USA":"🇺🇸",
            "United States":"🇺🇸",
            "Canada":"🇨🇦",
            "Australia":"🇦🇺",
            "Germany":"🇩🇪",
            "France":"🇫🇷",
            "Italy":"🇮🇹",
            "UK":"🇬🇧",
            "United Kingdom":"🇬🇧",
            "Malaysia":"🇲🇾",
            "Indonesia":"🇮🇩",
            "Vietnam":"🇻🇳",
            "Turkey":"🇹🇷",
            "Nepal":"🇳🇵",
            "Sri Lanka":"🇱🇰"
        };

        data.forEach((item,index)=>{

            const div=document.createElement("div");

            div.className="destination-item";

            const flag=flags[item.destination] || "🌍";

            div.innerHTML=`

                <div style="display:flex;align-items:center;gap:15px;">

                    <div style="
                        width:48px;
                        height:48px;
                        border-radius:14px;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        font-size:24px;
                        background:rgba(255,255,255,.08);
                    ">
                        ${flag}
                    </div>

                    <div>

                        <div style="
                            font-weight:700;
                            font-size:16px;
                        ">
                            ${item.destination}
                        </div>

                        <div style="
                            color:#94A3B8;
                            font-size:13px;
                        ">
                            Travel eSIM
                        </div>

                    </div>

                </div>

                <div style="
                    background:linear-gradient(135deg,#3B82F6,#7C3AED);
                    color:white;
                    padding:8px 16px;
                    border-radius:999px;
                    font-weight:700;
                    min-width:60px;
                    text-align:center;
                ">
                    ${Number(item.orders).toLocaleString()}
                </div>

            `;

            list.appendChild(div);

            div.animate(
                [
                    {
                        opacity:0,
                        transform:"translateX(25px)"
                    },
                    {
                        opacity:1,
                        transform:"translateX(0)"
                    }
                ],
                {
                    duration:500,
                    delay:index*100,
                    fill:"forwards",
                    easing:"ease-out"
                }
            );

        });

        showToast("Top Destinations Updated");

    }

    catch(err){

        console.error(err);

        showToast("Unable to load destinations","error");

    }

}
async function loadCharts() {

    const headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
    };

    try {

        // ===========================
        // DAILY REVENUE
        // ===========================

        const dailyResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/daily_revenue`,
            {
                method: "POST",
                headers
            }
        );

        if (!dailyResponse.ok)
            throw new Error("Failed to fetch daily revenue");

        const dailyData = await dailyResponse.json();

        const dailyCanvas = document.getElementById("dailyChart");

        const ctx = dailyCanvas.getContext("2d");

        const gradient = ctx.createLinearGradient(0,0,0,350);

        gradient.addColorStop(0,"rgba(59,130,246,.45)");
        gradient.addColorStop(1,"rgba(59,130,246,0)");

        new Chart(ctx,{

            type:"line",

            data:{

                labels:dailyData.map(x=>x.day),

                datasets:[{

                    label:"Revenue",

                    data:dailyData.map(x=>x.revenue),

                    borderColor:"#3B82F6",

                    backgroundColor:gradient,

                    fill:true,

                    borderWidth:4,

                    tension:.45,

                    pointRadius:5,

                    pointHoverRadius:8,

                    pointBorderWidth:3,

                    pointBackgroundColor:"#fff",

                    pointBorderColor:"#3B82F6"

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                animation:{

                    duration:1800,

                    easing:"easeOutQuart"

                },

                interaction:{

                    mode:"index",

                    intersect:false

                },

                plugins:{

                    legend:{

                        display:false

                    },

                    tooltip:{

                        backgroundColor:"#111827",

                        titleColor:"#fff",

                        bodyColor:"#fff",

                        padding:14,

                        cornerRadius:14,

                        displayColors:false

                    }

                },

                scales:{

                    x:{

                        ticks:{

                            color:"#CBD5E1"

                        },

                        grid:{

                            color:"rgba(255,255,255,.05)"

                        }

                    },

                    y:{

                        ticks:{

                            color:"#CBD5E1"

                        },

                        grid:{

                            color:"rgba(255,255,255,.05)"

                        }

                    }

                }

            }

        });

        // ===========================
        // MONTHLY REVENUE
        // ===========================

        const monthlyResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/monthly_revenue`,
            {
                method:"POST",
                headers
            }
        );

        if(!monthlyResponse.ok)
            throw new Error("Failed to fetch monthly revenue");

        const monthlyData=await monthlyResponse.json();

        new Chart(document.getElementById("monthlyChart"),{

            type:"bar",

            data:{

                labels:monthlyData.map(x=>x.month),

                datasets:[{

                    label:"Revenue",

                    data:monthlyData.map(x=>x.revenue),

                    backgroundColor:[
                        "#3B82F6",
                        "#6366F1",
                        "#8B5CF6",
                        "#A855F7",
                        "#2563EB",
                        "#4F46E5",
                        "#7C3AED",
                        "#06B6D4",
                        "#0EA5E9",
                        "#0891B2",
                        "#0284C7",
                        "#3B82F6"
                    ],

                    borderRadius:16,

                    borderSkipped:false,

                    maxBarThickness:42

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                animation:{

                    duration:1600,

                    easing:"easeOutBounce"

                },

                plugins:{

                    legend:{

                        display:false

                    },

                    tooltip:{

                        backgroundColor:"#111827",

                        titleColor:"#fff",

                        bodyColor:"#fff",

                        padding:14,

                        cornerRadius:14,

                        displayColors:false

                    }

                },

                scales:{

                    x:{

                        ticks:{

                            color:"#CBD5E1"

                        },

                        grid:{

                            display:false

                        }

                    },

                    y:{

                        ticks:{

                            color:"#CBD5E1"

                        },

                        grid:{

                            color:"rgba(255,255,255,.05)"

                        }

                    }

                }

            }

        });

        showToast("Charts Loaded");

    }

    catch(err){

        console.error(err);

        showToast("Unable to load charts","error");

    }

}
function downloadCSV() {

    const rows = [

        ["Metric", "Value"],

        ["Today's Orders", document.getElementById("todayOrders").innerText],

        ["Today's Revenue", document.getElementById("todayRevenue").innerText],

        ["Monthly Orders", document.getElementById("monthlyOrders").innerText],

        ["Monthly Revenue", document.getElementById("monthlyRevenue").innerText],

        ["Downloaded On", new Date().toLocaleString()]

    ];

    const csvContent = rows
        .map(row => row.join(","))
        .join("\n");

    const blob = new Blob(
        [csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `Travel_eSIM_Dashboard_${new Date().toISOString().slice(0,10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast("CSV Downloaded Successfully");

}
window.addEventListener("DOMContentLoaded", () => {

    loadDashboard();

    loadLeaderboard();

    loadDestinations();

    loadCharts();

});
setInterval(() => {

    loadDashboard();

    loadLeaderboard();

    loadDestinations();

    loadCharts();

}, 300000); // Refresh every 5 minutes
