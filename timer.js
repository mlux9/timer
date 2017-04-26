var canvas = document.getElementById("timerCanvas");
canvas.width = 300;
canvas.height = 300;

var ctx = canvas.getContext("2d");

function drawTimer() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw timer circle outline
	centreX = canvas.width / 2;
	centreY = canvas.height / 2;
	radius = 100;
	startAngle = 0;
	endAngle = 2*Math.PI;

	ctx.beginPath();
	ctx.arc(centreX, centreY, radius, startAngle, endAngle);
	ctx.stroke();

	// Draw remaining time slice

	// Minutes
	startAngle = 1.5*Math.PI;
	endAngle = (((2*Math.PI / 60) / 60) * ((Timer.minutes * 60) + (Timer.seconds))) - 0.5*Math.PI;
	endAngle = clampAngle(endAngle);
	//if (Timer.minutes !== 0) {
		ctx.fillStyle = Timer.minuteColour;
		ctx.beginPath();
		ctx.moveTo(centreX, centreY);
		ctx.arc(centreX, centreY, radius, startAngle, endAngle);
		ctx.closePath();
		ctx.fill();
	//}

	// Seconds 
	secondsAngle = (2*Math.PI / 60 * Timer.seconds) - 0.5*Math.PI;
	secondsAngle = clampAngle(secondsAngle);
	endX = centreX + (radius * Math.cos(secondsAngle));
	endY = centreY + (radius * Math.sin(secondsAngle)); 
	ctx.beginPath();
	ctx.moveTo(centreX, centreY);
	ctx.lineTo(endX, endY);
	ctx.strokeStyle = Timer.secondColour;
	ctx.stroke();

	drawTimerFace();
}

// Draws the minute markings on the timer face 
function drawTimerFace() {
	for (var i = 0; i < 60; ++i) {
		var angle = (2*Math.PI / 60 * i);
		if (i%5 === 0) { 
			var start_from_x = centreX + ((radius - 15) * Math.cos(angle));
			var start_from_y = centreY + ((radius - 15) * Math.sin(angle));
		} else {
			var start_from_x = centreX + ((radius - 5) * Math.cos(angle));
			var start_from_y = centreY + ((radius - 5) * Math.sin(angle));
		}
		var end_at_x = centreX + (radius * Math.cos(angle));
		var end_at_y = centreY + (radius * Math.sin(angle));

		ctx.beginPath();
		ctx.moveTo(start_from_x, start_from_y);
		ctx.lineTo(end_at_x, end_at_y);
		ctx.stroke();
	}
}

// Clamps angle between 2pi > ANGLE >= 0
function clampAngle(angle) {
	if (angle >= 2*Math.PI) {
		return angle - 2*Math.PI;
	}
	if (angle < 0) {
		return 2*Math.PI + angle;
	}
	return angle;
}

var Timer = new TimerObj();

function getTime() {
	var description = "";
	var minutes = 0;
	var seconds = 0;

	// Absolute values 
	if (document.getElementById('task_description').value) {
		description = document.getElementById('task_description').value;
	}
	if (document.getElementById('minutes').value) {
		minutes = document.getElementById('minutes').value;
	}
	if (document.getElementById('seconds').value) {
		seconds = document.getElementById('seconds').value;
	}

	var str = "Timer set to " + minutes + " minutes and " + seconds + " seconds. <br> Task description is " + description + "<br>";

	document.getElementById("time_set").innerHTML = str;

	var time = new Task_Time(minutes, seconds);
	var remaining_time = new Task_Time(minutes, seconds);
	var task = new Task(description, time, remaining_time);

	document.getElementById("time_left").innerHTML = "Time left: " + minutes + "minutes and " + seconds + " seconds."
	setTimer(task);
	
}

function setTimer(Task) {
	Timer.task = Task;

	if (Timer.timer) { clearInterval(Timer.timer); }
	Timer.minutes = Task.time.minutes;
	Timer.seconds = Task.time.seconds;

	Timer.running = true;

	drawTimer();

	Timer.timer = setInterval(function() {
		var time_left = (Timer.minutes * 60) + Timer.seconds - 1; // Time left in seconds
		
		Timer.seconds = Timer.seconds - 1;
		if (time_left <= 0) {
			clearInterval(Timer.timer);
			document.getElementById("time_left").innerHTML = "Timed out";
		} else {
			
			if (Timer.seconds < 0) {
				Timer.seconds = 59;
				Timer.minutes = Timer.minutes - 1;
			}
			document.getElementById("time_left").innerHTML = "Time left: " + Timer.minutes + "minutes and " + Timer.seconds + " seconds."

			
		}

		drawTimer();
	
	}, 1000);

	document.getElementById("stop_button").style.visibility = "visible";
	document.getElementById("pause_button").style.visibility = "visible";
	document.getElementById("pause_button").innerHTML = "Pause";

}

function stopTimer() {
	if (Timer.timer) { clearInterval(Timer.timer); }
	Timer = new TimerObj();
	document.getElementById("time_left").innerHTML = "Timer stopped."
	document.getElementById("stop_button").style.visibility = "hidden";
	document.getElementById("pause_button").style.visibility = "hidden";
}

function pauseTimer() {
	// Check whether to pause or resume
	if (Timer.running === true) { // Pause
		if (Timer.timer) { clearInterval(Timer.timer); }
		Timer.running = false;
		Timer.task.remaining_time = new Task_Time(Timer.minutes, Timer.seconds);
		document.getElementById("pause_button").innerHTML = "Resume";
	} else { // Resume
		Timer.running = true;
		
		// Below is repeating setTimer...just changed the values of Timer.minutes and Timer.seconds
		if (Timer.timer) { clearInterval(Timer.timer); }
		printTask(Timer.task);
		Timer.minutes = Timer.task.remaining_time.minutes;
		Timer.seconds = Timer.task.remaining_time.seconds;

		drawTimer();

		Timer.timer = setInterval(function() {
			var time_left = (Timer.minutes * 60) + Timer.seconds - 1; // Time left in seconds

			if (time_left <= 0) {
				clearInterval(Timer.timer);

				document.getElementById("time_left").innerHTML = "Timed out";
			} else {
				Timer.seconds = Timer.seconds - 1;
				if (Timer.seconds < 0) {
					Timer.seconds = 59;
					Timer.minutes = Timer.minutes - 1;
				}
				document.getElementById("time_left").innerHTML = "Time left: " + Timer.minutes + "minutes and " + Timer.seconds + " seconds.";
			}

			drawTimer();			

		}, 1000);

		document.getElementById("pause_button").innerHTML = "Pause";
	}
	

}


// function Timer = {
// 	task: 
// 	minutes: 
// 	seconds: 
// }

function TimerObj() {
	this.timer = null;
	this.task = null;
	this.minutes = 0;
	this.seconds = 0;
	this.running = false;

	this.minuteColour = "#ff0000";
	this.secondColour = "#000000";
}

function Task(description, task_time, remaining_time) { 
	//this.id = //randomise id number
	this.description = description;
	// list:
	this.time = task_time; // Task_Time 
	this.remaining_time = remaining_time;
}

// Use Number() to convert to a number otherwise you will get weird errors from unintentional concatenation as strings...
function Task_Time(minutes, seconds) {
	this.minutes = Number(minutes);
	this.seconds = Number(seconds);
}

function printTaskTime(Task_Time) {
	console.log("Minutes: " + Task_Time.minutes);
	console.log("Seconds: " + Task_Time.seconds);
}

function printTask(Task) {
	console.log("Description: " + Task.description);
	console.log("Time: ");
	printTaskTime(Task.time);
	console.log("Remaining Time: " );
	printTaskTime(Task.remaining_time);
}

function changeColour() {
	Timer.minuteColour = document.getElementById("minuteColour").value;
	Timer.secondColour = document.getElementById("secondColour").value;
}


/*
https://code.tutsplus.com/tutorials/how-to-draw-a-pie-chart-and-doughnut-chart-using-javascript-and-html5-canvas--cms-27197
*/

