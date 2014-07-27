var Robot = Robot || {};

// Not being used yet, need to switch to use this.
Robot.settings = function () {
    var camera_ip = "192.168.1.2";
    var arduino_ip = "192.168.1.177";
    var camera_image_url = ["http://", camera_ip, "/image.jpg"].join("");
    var arduino_api_url =  "http://" + arduino_ip;

    return {
       camera_ip: camera_ip,
       arduino_ip: arduino_ip,
       camera_image_url: camera_image_url,
       arduino_api_url: arduino_api_url
    };
}();

Robot.loading = $('<div class="center"><i class="fa fa-spinner fa-spin"></i> Loading...</div>');

Robot.timers = {
    "rotationDelay": 0,
    "rotationReset": 0,
    "angleDelay": 0,
    "angleReset": 0
};

Robot.error = function error(error) {
    var error = error || "";

    if (error != "") {
        var template = $('<li class="message">' + error +
        '<span class="js-dismiss close"></span></li>');
        $(".error-list").append(template);
    }

    // Change indicator led based on error count
    var errorCount = $(".error-list").find("li").length;
    if (errorCount > 0) {
        $(".js-warning").addClass("warning");
    } else {
        $(".js-warning").removeClass("warning");
    }
}

Robot.snapshot = function snapshot() {
    var check = confirm("Save camera image?");
    if (check == true) {
        window.open(Robot.settings.camera_image_url, "_blank");
    }
}

Robot.terminate = function terminate() {
    var request = new XMLHttpRequest();
    request.open("POST", "/api/terminate/", true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.send({});
}

Robot.renderArmControl = function renderArmControl(container, arm_id) {
    var loading = Robot.loading.clone();
    $(container).append(loading);
    var control = $('<div class="panel"></div>');
    $.ajax({
        type: "GET",
        url: "/api/robot/body/arms/" + arm_id
    }).success(function(arm) {
        if (arm.shoulder) {
            var row = $('<div>Shoulder <input type="number" min="0" max="100"></div>');
            row.find("input").val(arm.shoulder.angle);
            row.find("input").data("url", arm.href + "/shoulder/");
            $(control).append(row);
        }
        if (arm.elbow) {
            var row = $('<div>Elbow <input type="number" min="0" max="100"></div>');
            row.find("input").val(arm.elbow.angle);
            row.find("input").data("url", arm.href + "/elbow/");
            $(control).append(row);
        }
        if (arm.wrist) {
            var row = $('<div>Wrist <input type="number" min="0" max="100"></div>');
            row.find("input").val(arm.wrist.pitch);
            row.find("input").data("url", arm.href + "/wrist/");
            $(control).append(row);
        }
        $(container).html(control);
        loading.remove();
    }).error(function() {
        Robot.error("Unable to load arm id " + arm_id);
    });

    control.on("input change", "input", function() {
        var value = $(this).val();
        value = JSON.stringify({ "angle": value })
        var data = $(this).data();

        $.ajax({
            type: "PATCH",
            url: data.url,
            data: value,
            contentType: "application/json"
        });
    });
}

Robot.renderLegControl = function renderLegControl(container, leg_id) {
    $(container).empty();
    $(container).append('<p>Not yet implemented. Id: ' + leg_id + '</p>');
}

Robot.renderArmControl(".js-arm-control-left", 0);
Robot.renderArmControl(".js-arm-control-right", 1);

Robot.renderLegControl(".js-leg-control-left", 0);
Robot.renderLegControl(".js-leg-control-right", 1);

$(".camera_ip").val(Robot.settings.camera_ip);
$(".arduino_ip").val(Robot.settings.arduino_ip);

/* CANVIS CODE FROM http://dwdii.github.io/2011/10/23/Using-HTML5-Canvas-tag-for-Simple-Video-Animation.html
Known issue: http://stackoverflow.com/questions/13674835/canvas-tainted-by-cross-origin-data */
var imageUpdateMs = 1;
var count = 0;
var newImg;

setTimeout("imageUpdate()", imageUpdateMs);

function imageUpdate() {
	document.getElementById("txt").innerHTML = count++;

	newImg = new Image();
	newImg.Id = "cam" + count;
	newImg.Name = newImg.Id;
	newImg.onload = imageLoaded;
	newImg.src = Robot.settings.camera_image_url;
}

function imageLoaded() {
	var context = $("#cam")[0].getContext('2d');
	context.drawImage(newImg,0,0,640,480,0,0,300,150);
	setTimeout("imageUpdate()", imageUpdateMs);
}
	
$.ajax({ 
    type: "GET", 
    url: Robot.settings.arduino_api_url, 
    data: { get_param: "value" }, 
    dataType: 'json'
}).success(function(data) {
    $.each(data, function(index, element) {
        $(".sensorValues").append("<tr><td>" + index + "</td><td>" + element + "</td></tr>");
    });
    $(".filter").removeClass("hide");
}).error(function() {
    Robot.error("Arduino api is unavailable.");
});

$(".js-terminate").click(function() {
    Robot.terminate();
});

$(".error-list").on("click", ".js-dismiss", function() {
    $(this).parents("li").remove();
    Robot.error();
});

$(".js-dismiss-all").click(function() {
    $(".error-list li").remove();
    Robot.error();
});

$("#post").click(function() {
    var key = $("#key").val();
    var value = $("#value").val();
    var str = [key, value].join("=");
    $.ajax({
        type: "POST",
        url: "http://" + arduino_ip,
        data: str,
        contentType: "application/x-www-form-urlencoded; charset=utf-8"
    }).success(function(data) {
        $("#key").val("");
        $("#value").val("");
        //TODO: UPDATE TABLE IF NEEDED WHEN POSTING Dx
        // if key in table table.key.val(key)
    }).error(function(data) {
        Robot.error("Failure to post data.");
    });
});

$("#say").click(function() {
    var key = "say";
    var value = $("#value").val();
    var str = [key, value].join("=");
    $.ajax({
        type: "POST",
        url: "http://"+arduino_ip,
        data: str,
        contentType: "application/x-www-form-urlencoded; charset=utf-8"
    }).success(function(data) {
        $("#key").val("");
        $("#value").val("");
    }).error(function(data) {
        Robot.error("Failure to post data");
    });
});

$("#write").click(function() {
    console.log("Write button not implemented");
});

$(".js-capture-photo").click(function() {
    Robot.snapshot();
});

$(".tabs").on("click", ".tab-title", function(event) {
    event.preventDefault();
    event.stopPropagation();

    $(this).siblings().removeClass("active");
    $(this).addClass("active");

    var id = $(this).find("a").attr("href");
    $(id).siblings().removeClass("active");
    $(id).addClass("active");
});

$(".js-rotate-head").on("input change", function() {
    var input = $(this);
    var value = input.val();
    value = parseInt(value);

    clearTimeout(Robot.timers.rotationReset);

    function zero() {

        if (Robot.timers.rotationReset) {
            clearTimeout(Robot.timers.rotationReset);
        }

        Robot.timers.rotationReset = setTimeout(function() {
            if (value > 0) {
                value -= 1;
                input.val(value);
                zero();
            }

            if (value < 0) {
                value += 1;
                input.val(value);
                zero();
            }
        }, 100);
    }

    if (Robot.timers.rotationDelay) {
        clearTimeout(Robot.timers.rotationDelay);
    }

    Robot.timers.rotationDelay = setTimeout(zero, 1000);
});

$(".js-angle-head").on("input change", function() {
    var input = $(this);
    var value = input.val();
    value = parseInt(value);

    clearTimeout(Robot.timers.angleReset);

    function zero() {

        if (Robot.timers.angleReset) {
            clearTimeout(Robot.timers.angleReset);
        }

        Robot.timers.angleReset = setTimeout(function() {
            if (value > 0) {
                value -= 1;
                input.val(value);
                zero();
            }

            if (value < 0) {
                value += 1;
                input.val(value);
                zero();
            }
        }, 100);
    }

    if (Robot.timers.angleDelay) {
        clearTimeout(Robot.timers.angleDelay);
    }

    Robot.timers.angleDelay = setTimeout(zero, 1000);
});
