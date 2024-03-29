let api = 'http://52.88.188.196:8080/api/api/where/';
let key = '?key=TEST';
let stopID = 'STA_ELMPUBWF';
let routeID = "";
let stopName = "";
let pcolor = '';
let scolor = '';
let imageurl = '';

//Runs On pageload
$(document).ready(start);

function start() {

    getRoute();
    $('#stopModal').modal('toggle');
    console.log(`👩💻Sarah & Rachael💻👩`);
    runApp();
    let timerId = setInterval(() => runApp(), 30000); //30 sec
    setTimeout(() => { clearInterval(timerId); alert('Clock Stopped'); }, 14400000); //One Min
    $("#updateStyle").click(updateStyles);
    $("#updateStop").click(givedata2);
}

// $(window).on('load', function () {
//     $('#updateStop').modal('show');
// });

//Add all of your AutoUpdating functions here
function runApp() {
    $("#app").replaceWith(`<div id=app></div>`);
    Displaytime();
    getTable();
}

//Update Style
function updateStyles() {
    pcolor = $("#pcolor").val();
    scolor = $("#scolor").val();
    imageurl = $("#imageurl").val();
    $("body").css("color", `#${pcolor}`);
    $("div.jumbotron").css("color", `#${pcolor}`);
    $(".btn.btn-primary").css("background-color", `#${pcolor}`);
    $("footer").css("color", `#${scolor}`);
    $("#logo").replaceWith(`<img id="logo" src="${imageurl}" alt="logo">`);
}

//Displays Time
function Displaytime() {
    $.get(`${api}current-time.json${key}`, function (data) {
        let curtime = formatTime(data.data.entry.time);
        $('#app').append(`
        <div class="jumbotron">
        <h1 id="curtime">${curtime}</h1>
        <h2 id="setStopID">${stopName}</h2>
        <div id="busComes"></div>
        </div>
        `);
    }, "jsonp");
}

// Formats Time to human readable
function formatTime(humanreadble) {
    let fulldate = new Date(humanreadble);
    let hours = fulldate.getHours();
    let min = fulldate.getMinutes();
    if (hours > 12) {
        hours = hours - 12;
    };
    if (min < 10) {
        min = `0${min}`;
    };
    return (`${hours}:${min}`);
}

// Creates Table
function getTable() {
    // <th scope="col">Departure Time(if different)</th>
    $.get(`${api}schedule-for-stop/${stopID}.json${key}`, function (data) {
        let schedule = data.data.entry.stopRouteSchedules;
        $('#app').append(`
        <table id="table" class="table table-bordered">
        <thead id="nextBus">
          <tr>
          <th scope="col">Stops aways</th>
            <th scope="col">Status</th>
            <th scope="col">Route Number & Name</th>
            <th scope="col">Scheduled/Estimated Arrival Time</th>
            <th scope="col">Departure Time</th>
          </tr>
        </thead>
        <tbody id="routesTable">

        </tbody>
        </table>
        `);
        getArrival();
        for (let i = 0; i < schedule.length; i++) {
            // let time = Math.round(schedule[i].stopRouteDirectionSchedules[0].scheduleStopTimes[0].arrivalTime.getTime() / 1000);
            let arrivaltime = new Date(schedule[i].stopRouteDirectionSchedules[0].scheduleStopTimes[0].arrivalTime * 1000.0);
            let departuretime = new Date(schedule[i].stopRouteDirectionSchedules[0].scheduleStopTimes[0].departureTime * 1000.0);
            $('#routesTable').append(`
            <tr>
            <td></td>
                <th scope="row">${schedule[i].routeId} ${schedule[i].stopRouteDirectionSchedules[0].tripHeadsign}</th>
                <td>Scheduled</td>
                <td>${formatTime(arrivaltime)}</td>
                <td>${formatTime(departuretime)}</td>
            </tr>
            `);
        }

    }, "jsonp");
}

//http://52.88.188.196:8080/api/api/where/routes-for-agency/STA.json?key=TEST
function getRoute() {
    $.get(`${api}routes-for-agency/STA.json${key}`, function (data) {
        for (var i = 0; i < data.data.list.length; i++) {
            var stop = data.data.list[i];
            var dispName = stop.longName + " " + stop.shortName;
            $("#exampleFormControlSelect1").append(`
            <option value='${stop.id}'>${dispName}</option>
            `);

        }
    }, "jsonp");

}



// How to update -> setintervals
// Departure Times are the intrested and the Predicted Departure/Arrival/?Actual? Time 
// Promises

//http://52.88.188.196:8080/api/api/where/stops-for-route/STA_66.json?key=
function getStops() {

    $.get(`${api}stops-for-route/${routeID}.json${key}`, function (data) {
        for (var i = 0; i < data.data.entry.stopIds.length; i++) {
            var stop = data.data.entry.stopIds[i];

            $("#exampleFormControlSelect2").append(`
            <option value='${stop}'>${stop}</option>
            `);

        }
    }, "jsonp");
}

function getArrival() {
    $.get(`${api}arrivals-and-departures-for-stop/${stopID}.json${key}`, function (data) {
        if (data.data.entry.arrivalsAndDepartures[0] == null) {
            $('#nextBus').append(`
            <tr  class="bg-danger">
                <th colspan="4"> No Data On Next Bus </th>
            </tr>
            `);
        } else {
            let nextBus = data.data.entry.arrivalsAndDepartures[0];
            let arrivalTime = formatTime(nextBus.predictedArrivalTime);
            let departureTime = formatTime(nextBus.predictedDepartureTime);
            let status = nextBus.tripStatus.status
            if (nextBus.tripStatus.status == 'SCHEDULED' || nextBus.tripStatus.status == 'default') {
                status = 'On Time';
            }

            if (nextBus.numberOfStopsAway >= 0) {
                if (nextBus.numberOfStopsAway < 1) {
                    popUp(true);
                } else {
                    popUp(false);
                }
                $('#nextBus').append(`
            <tr  class="bg-warning">
            <td>${nextBus.numberOfStopsAway}</td>
                <th scope="row">${nextBus.routeShortName} - ${nextBus.routeLongName}</th>
                <td>${status}</td>
                <td>${arrivalTime}</td>
                <td>${departureTime}</td>
                
            </tr>
            `);
            }

        }

    }, "jsonp");

}

function popUp(tf) {
    if (tf) {
        $('#busComes').replaceWith(`
    <div id="busComes" class="alert alert-warning alert-dismissible fade in">
    <audio autoplay><source src="mysound.mp3" type="audio/mpeg" /></audio>
        <h1><strong>The Next Bus Will Arrive Shortly</strong></h1>
    </div>
    `);
    } else {
        $('#busComes').replaceWith(`
        <div id="busComes">
        </div>
    `);
    }
}

function givedata(id) {
    routeID = id;
    getStops();
}
function givedata2() {
    stopID = $("#exampleFormControlSelect2 option:selected").val();
    clearTable();
    getTable();
    getName();
    $('#styleModal').modal('toggle');
}

function getName() {
    $.get(`${api}stop/${stopID}.json${key}`, function (data) {
        stopName = data.data.entry.name;
        $('#setStopID').replaceWith(`
     <h2 id="setStopID">${stopName}</h2>   
    `);

    }, "jsonp");
}

function clearTable() {
    $('#table').replaceWith('');
}
