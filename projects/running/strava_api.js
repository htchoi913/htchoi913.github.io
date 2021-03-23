const auth_link = "https://www.strava.com/oauth/token"

console.log('string')

columnNames = ['name', 'distance', 'elapsed_time', 'total_elevation_gain']

function getActivites(res) {
    //console.log(res.access_token)
    const activities_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${res.access_token}`
    fetch(activities_link)
        .then((res) => res.json())
        .then(res => createTable(res))
}

function tabulate(data, columns) {
    var table = d3.select('body').append('table')
    var thead = table.append('thead')
    var	tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
    .selectAll('th')
    .data(columns).enter()
    .append('th')
        .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
    .data(data)
    .enter()
    .append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
    .data(function (row) {
        return columns.map(function (column) {
        return {column: column, value: row[column]};
        });
    })
    .enter()
    .append('td')
        .text(function (d) { return d.value; });

    return table;
}

function createTable(res) {

    console.log(res)

    var data = []

    for (var i = 0; i < res.length; i++) {
        
        var temp_date = new Date(res[i].start_date_local)

        var temp = {
            'Date': temp_date.toDateString(),
            'Distance (mi.)':(res[i].distance/1609.34).toFixed(2),
            'Elapsed Time':Math.floor(res[i].elapsed_time/60).toString().concat(" m ")
                            .concat(res[i].elapsed_time % 60).concat(" s"),
            'Average Heart Rate':res[i].average_heartrate,
            'Total Elevation Gain':res[i].total_elevation_gain
        }
        data.push(temp)
    }

    var columnNames = Object.keys(data[0])

    tabulate(data, columnNames)
}

function reAuthorize(){
    fetch(auth_link,{
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            client_id: '61303',
            client_secret: '8d928b41c60eda007da3baa6b3ce2476ce48d947',
            refresh_token: 'f43a959fedcb24a5b57ba1dc656c9dc71139a974',
            grant_type: 'refresh_token'
        })

    }).then(res => res.json())
    .then(res => getActivites(res))
}

reAuthorize()