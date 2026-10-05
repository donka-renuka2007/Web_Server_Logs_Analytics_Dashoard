const visualAnalyticsData = {
    "images/client_error_vs_page.png": {
        hive_query: `select
request_url as page,
count(*) as total
from WebServerLogs
where status_code = 404
GROUP BY request_url;`,
        script: `logs_404 = FILTER WebServerLogs BY status_code == 404;
grp_404 = GROUP logs_404 BY request_url;
count_404 = FOREACH grp_404 GENERATE group AS page, COUNT(logs_404) AS total;
DUMP count_404;`
    },

    "images/Day_vs_Req.png": {
        hive_query: `select
log_date,
count(*) as total_requests
from WebServerLogs
GROUP BY log_date;`,
        script: `grp_date = GROUP WebServerLogs BY log_date;
req_per_date = FOREACH grp_date GENERATE group AS log_date, COUNT(WebServerLogs) AS total_requests;
DUMP req_per_date;`
    },

    "images/device_vs_req.png": {
        hive_query: `select 
case 
when LOWER(user_agent) LIKE '%bot%' OR LOWER(user_agent) LIKE '%spider%' THEN 'bot / crawler'
WHEN LOWER(user_agent) LIKE '%mobile%' OR LOWER(user_agent) LIKE '%android%' OR LOWER(user_agent) LIKE '%iphone%' THEN 'Mobile'
WHEN LOWER(user_agent) LIKE '%tablet%' OR LOWER(user_agent) LIKE '%ipad%' THEN 'Tablet'
WHEN LOWER(user_agent) LIKE '%window%' OR LOWER(user_agent) LIKE '%linux%' OR LOWER(user_agent) LIKE '%macintosh%' OR LOWER(user_agent) LIKE '%x11%' THEN 'Desktop'
ELSE 'unknown'
END AS device_type,
count(*) as total_requests
from WebServerLogs
GROUP BY
case 
when LOWER(user_agent) LIKE '%bot%' OR LOWER(user_agent) LIKE '%spider%' THEN 'bot / crawler'
WHEN LOWER(user_agent) LIKE '%mobile%' OR LOWER(user_agent) LIKE '%android%' OR LOWER(user_agent) LIKE '%iphone%' THEN 'Mobile'
WHEN LOWER(user_agent) LIKE '%tablet%' OR LOWER(user_agent) LIKE '%ipad%' THEN 'Tablet'
WHEN LOWER(user_agent) LIKE '%window%' OR LOWER(user_agent) LIKE '%linux%' OR LOWER(user_agent) LIKE '%macintosh%' OR LOWER(user_agent) LIKE '%x11%' THEN 'Desktop'
ELSE 'unknown'
END;`,
        script: `classified_device = FOREACH WebServerLogs GENERATE 
    ((LOWER(user_agent) MATCHES '.*bot.*' OR LOWER(user_agent) MATCHES '.*spider.*') ? 'bot / crawler' :
     ((LOWER(user_agent) MATCHES '.*mobile.*' OR LOWER(user_agent) MATCHES '.*android.*' OR LOWER(user_agent) MATCHES '.*iphone.*') ? 'Mobile' :
      ((LOWER(user_agent) MATCHES '.*tablet.*' OR LOWER(user_agent) MATCHES '.*ipad.*') ? 'Tablet' :
       ((LOWER(user_agent) MATCHES '.*window.*' OR LOWER(user_agent) MATCHES '.*linux.*' OR LOWER(user_agent) MATCHES '.*macintosh.*' OR LOWER(user_agent) MATCHES '.*x11.*') ? 'Desktop' : 'unknown')))) AS device_type;

grp_device = GROUP classified_device BY device_type;
req_per_device = FOREACH grp_device GENERATE group AS device_type, COUNT(classified_device) AS total_requests;
DUMP req_per_device;`
    },

    "images/Hour_vs_Req.png": {
        hive_query: `select 
hour,
count(*) as total_requests
from WebServerLogs
GROUP BY hour;`,
        script: `grp_hour = GROUP WebServerLogs BY hour;
req_per_hour = FOREACH grp_hour GENERATE group AS hour, COUNT(WebServerLogs) AS total_requests;
DUMP req_per_hour;`
    },

    "images/ip_vs_req.png": {
        hive_query: `select
ip_address as user_id,
count(*) as total_requests
from WebServerLogs
group by ip_address;`,
        script: `grp_ip = GROUP WebServerLogs BY ip_address;
req_per_ip = FOREACH grp_ip GENERATE group AS user_id, COUNT(WebServerLogs) AS total_requests;
DUMP req_per_ip;`
    },

    "images/ip_vs_resource_used.png": {
        hive_query: `select
ip_address as user_id,
sum(bytes_transferred) as resource_used
from WebServerLogs
GROUP BY ip_address;`,
        script: `grp_ip_bytes = GROUP WebServerLogs BY ip_address;
user_resource = FOREACH grp_ip_bytes GENERATE group AS user_id, SUM(WebServerLogs.bytes_transferred) AS resource_used;
DUMP user_resource;`
    },

    "images/page_vs_req.png": {
        hive_query: `select
request_url as page,
count(*) as total_requests
from WebServerLogs
group by request_url;`,
        script: `grp_page = GROUP WebServerLogs BY request_url;
req_per_page = FOREACH grp_page GENERATE group AS page, COUNT(WebServerLogs) AS total_requests;
DUMP req_per_page;`
    },

    "images/server_error_vs_page.png": {
        hive_query: `select 
request_url as page,
count(*) as total
from WebServerLogs 
where status_code between 500 and 599
GROUP BY request_url
ORDER BY total DESC;`,
        script: `logs_5xx = FILTER WebServerLogs BY (status_code >= 500 AND status_code <= 599);
grp_5xx = GROUP logs_5xx BY request_url;
count_5xx = FOREACH grp_5xx GENERATE group AS page, COUNT(logs_5xx) AS total;
ord_5xx = ORDER count_5xx BY total DESC;
DUMP ord_5xx;`
    },

    "images/status_code_vs_req.png": {
        hive_query: `select
case
when status_code between 200 and 299 THEN 'Success (2xx)'
when status_code between 300 and 399 THEN 'Redirection (3xx)'
when status_code between 400 and 499 THEN 'Client Error (4xx)'
when status_code between 500 and 599 THEN 'Server Error (5xx)'
ELSE 'UNKNOWN'
END AS types_of_codes,
count(*) as total_requests
from WebServerLogs
GROUP BY
case
when status_code between 200 and 299 THEN 'Success (2xx)'
when status_code between 300 and 399 THEN 'Redirection (3xx)'
when status_code between 400 and 499 THEN 'Client Error (4xx)'
when status_code between 500 and 599 THEN 'Server Error (5xx)'
ELSE 'UNKNOWN'
END;`,
        script: `classified_status = FOREACH WebServerLogs GENERATE 
    ((status_code >= 200 AND status_code <= 299) ? 'Success (2xx)' :
     ((status_code >= 300 AND status_code <= 399) ? 'Redirection (3xx)' :
      ((status_code >= 400 AND status_code <= 499) ? 'Client Error (4xx)' :
       ((status_code >= 500 AND status_code <= 599) ? 'Server Error (5xx)' : 'UNKNOWN')))) AS types_of_codes;

grp_status = GROUP classified_status BY types_of_codes;
req_per_status = FOREACH grp_status GENERATE group AS types_of_codes, COUNT(classified_status) AS total_requests;
DUMP req_per_status;`
    },

    "images/Time_of_Day_vs_Req.png": {
        hive_query: `select
case 
when hour between 5 and 11 then 'Morning'
when hour between 12 and 16 then 'Afternoon'
when hour between 17 and 20 then 'Evening'
else 'Night'
END AS time_of_day,
count(*) as total_requests
FROM WebServerLogs
GROUP BY
case 
when hour between 5 and 11 then 'Morning'
when hour between 12 and 16 then 'Afternoon'
when hour between 17 and 20 then 'Evening'
else 'Night'
END;`,
        script: `classified_time = FOREACH WebServerLogs GENERATE 
    ((hour >= 5 AND hour <= 11) ? 'Morning' : 
     ((hour >= 12 AND hour <= 16) ? 'Afternoon' : 
      ((hour >= 17 AND hour <= 20) ? 'Evening' : 'Night'))) AS time_of_day;

grp_time = GROUP classified_time BY time_of_day;
req_per_time = FOREACH grp_time GENERATE group AS time_of_day, COUNT(classified_time) AS total_requests;
DUMP req_per_time;`
    },

    "images/user_agent_vs_req.png": {
        hive_query: `select
user_agent,
count(*) as total_requests
from WebServerLogs
GROUP BY user_agent;`,
        script: `grp_ua = GROUP WebServerLogs BY user_agent;
req_per_ua = FOREACH grp_ua GENERATE group AS user_agent, COUNT(WebServerLogs) AS total_requests;
DUMP req_per_ua;`
    }
};
function showVisual(imagePath) {
    const obj = document.querySelector('.right-panel'); 
    const data = visualAnalyticsData[imagePath];
    
    let msg = `
        <div class="visual-card">
            <img src="${imagePath}" alt="Visual Representation">
            <div class="code-section">
                <h3>Hive Query</h3>
                <pre><code class="language-sql">${data.hive_query}</code></pre>
                <button class="copy-btn" onclick="copyToClipBoard('${imagePath}','hive_query')">
                copy</copy>
            </div>
            <div class="code-section">
                <h3>Pig Latin Script</h3>
                <pre><code class="language-pig">${data.script}</code></pre>
                <button class="copy-btn" onclick="copyToClipBoard('${imagePath}','script')">copy</button>
            </div>
        </div>
    `;
    
    obj.innerHTML = msg;
}
function copyToClipBoard(imagePath,choice){
  let code=visualAnalyticsData[`${imagePath}`][`${choice}`];
  navigator.clipboard.writeText(code);
  alert('Copied');
}