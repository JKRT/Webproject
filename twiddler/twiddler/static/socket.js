tsocket = null;
lsocket = null;
TwiddlerSocket = function(email, token) {
    var userEmail = email;
    var userToken = token;
    var handle = new WebSocket("ws://localhost:7777/websocket");
    console.log("Connecting to Twiddler WebSocket...");
    console.log("State of connection is '" + handle.readyState + "'.");

    handle.onopen = function(event) {
        console.log("Twiddler WebSocket has opened!");
        console.log("Sending token and email, hoping to gain access...");
	if(userEmail != null)
            data = {email: userEmail, token: userToken};
	else 
	    data = {token:userToken};
        handle.send(JSON.stringify(data));
    };

    this.close = function() { 
	handle.close(); 
    };

    handle.onmessage = function(event) {
	if( event.data === "close" ) {
	    console.log("Logging user out of application...");
	    sessionStorage.removeItem("token");
	    displayView(); 
	}
    };
};


liveDataSocket = function() {
    console.log("Connecting to liveDataSocket...");
    var handle = new WebSocket("ws://localhost:7777/media_socket");
    // Todo move this accordingly
    this.ctx = null; //document.getElementById("activeUsersCanvas").getContext("2d");
    this.myBarChart = null; //new Chart(ctx).Bar(this.data, options);

    /*Updates post data and generates a graph*/
    this.updatePostData = function (userToken) {
	console.log("Called updatePostRatio");
	data = {token: userToken, message:"post"};
	handle.send( JSON.stringify(data));
    };
    /*Updates gender ratio and renders the pie-chart */
    this.updateGenderRatio = function (userToken) { 
	console.log("Called updateGenderRatio");
	data = {token: userToken, message:"signup"};
	handle.send(JSON.stringify(data));
    };

    console.log("State of liveDataSocket connection is '" + handle.readyState + "'.");

    handle.onopen = function(event) {
        console.log("Live data socket has opened!");
    };

    this.close = function() { 
	console.log("Live data socket has closed!");
	handle.close(); 
    };

    handle.onmessage = function(event) {
	hoochymama = data = JSON.parse(event.data);
	console.log("Live data socket recieved message:" + data);
	//riktigt fult..
	if(JSON.stringify(data).replace('{' , '').split(':')[0].replace(/^"(.*)"$/, '$1') == "genderStatistics") {
	    console.log("Updating gender data");
	    for ( i = 0; i < 3; ++i ) {
		genderRatioData[i].value = data.genderStatistics[i];
	    }
	    console.log("Gender statistics updated");
	} else if(JSON.stringify(data).replace('{' , '').split(':')[0].replace(/^"(.*)"$/, '$1') == "postData" ) {       								
	    console.log("Updating post related data" + data);
	    console.log("Updating postRatioData");
	    for (i = 0; i < 2 ; ++i) {
		postRatioData[i].value = data.postData[0][i];
	    }
	    console.log("Updating postPerDayData");
	    for(i = 0 ; i < 7 ; ++i) {
		postPerDayData.datasets.data[i] = data.postData[0][i];
	    }
	}

    };
  
    this.renderGenderChart = function () {
	if (currentView.name == "showAccount") {
	    var ctx = document.getElementById("genderBalanceCanvas").getContext("2d");
	    var myBarChart = new Chart(ctx).Pie(genderRatioData, chartOptions);
	}
    };

    this.renderPostRatioChart = function() {
	if (currentView.name == "showAccount") {
	    var ctx = document.getElementById("postRatioCanvas").getContext("2d");
	    var myBarChart = new Chart(ctx).Pie(postRatioData, chartOptions);
	}
    };

    this.renderPostPerDayChart = function() {
	if (currentView.name == "showAccount") {
	    var ctx = document.getElementById("postPerDayCanvas").getContext("2d");
	    var myBarChart = new Chart(ctx).Bar(postPerDayData, postPerDayOptions);
	}
    };


    var postPerDayData = {
	labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
	datasets: [
            {
		label: "My First dataset",
		fillColor: "rgba(300,220,220,0.5)",
		strokeColor: "rgba(220,220,220,0.8)",
		highlightFill: "rgba(400,220,220,0.75)",
		highlightStroke: "rgba(220,220,220,1)",
		data: [0, 0, 0, 0, 0, 0, 0]
            }
	]
    };

   var postRatioData = [
	{
            value: 0,
            color:"#F7464A",
            highlight: "#FF5A5E",
            label: "Red"
	},
	{
            value: 0,
            color: "#FDB45C",
            highlight: "#FFC870",
            label: "Yellow"
	}
    ];

    var genderRatioData = [
	{
            value: 0,
            color:"#F7464A",
            highlight: "#FF5A5E",
            label: "Men"
	},
	{
            value: 0,
            color: "#46BFBD",
            highlight: "#5AD3D1",
            label: "Gender-neutral"
	},
	{
            value: 0,
            color: "#FDB45C",
            highlight: "#FFC870",
            label: "Women"
	}
    ];

};

postPerDayOptions = {
    //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
    scaleBeginAtZero : true,

    //Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : false,

    //String - Colour of the grid lines
    scaleGridLineColor : "rgba(0,0,0,.05)",

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,

    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,

    //Boolean - If there is a stroke on each bar
    barShowStroke : true,

    //Number - Pixel width of the bar stroke
    barStrokeWidth : 2,

    //Number - Spacing between each of the X value sets
    barValueSpacing : 5,

    //Number - Spacing between data sets within X values
    barDatasetSpacing : 1,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

};


chartOptions = {
    //Boolean - Whether we should show a stroke on each segment
    segmentShowStroke : true,

    //String - The colour of each segment stroke
    segmentStrokeColor : "#fff",

    //Number - The width of each segment stroke
    segmentStrokeWidth : 2,

    //Number - The percentage of the chart that we cut out of the middle
    percentageInnerCutout : 50, // This is 0 for Pie charts

    //Number - Amount of animation steps
    animationSteps : 1000,

    //String - Animation easing effect
    animationEasing : "easeOutBounce",

    //Boolean - Whether we animate the rotation of the Doughnut
    animateRotate : true,

    //Boolean - Whether we animate scaling the Doughnut from the centre
    animateScale : false,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

};
