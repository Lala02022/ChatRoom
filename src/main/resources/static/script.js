var stompClient = null;

function sendMessage() {
    console.log('Name before sending message:', localStorage.getItem("name"));
    let jsonOb = {
        name: localStorage.getItem("name"),
        content: $("#message-value").val()
    };
    stompClient.send("/app/message", {}, JSON.stringify(jsonOb));
}

function showMessage(message) {
    $("#message-container-table").prepend(`<tr><td><b>${message.name} :</b> ${message.content}</td></tr>`);
}

function connect() {
    let socket = new SockJS("/server1");

    stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
        console.log("Connected : " + frame);
        $("#name-from").addClass('d-none');
        $("#chat-room").removeClass('d-none');
        $("#send-btn").prop("disabled", false);

        stompClient.subscribe("/topic/return-to", function(response) {
            showMessage(JSON.parse(response.body));
        });
    }, function(error) {
        // connection error handler
        console.log('STOMP connection error', error);
    });
}

$(document).ready(() => {
    $("#login").click(() => {
        let name = $("#name-value").val();

        if (name) {
            console.log('Setting name:', name);
            localStorage.setItem("name", name);
            $("#name-title").html(`Welcome , <b>${name} </b>`);
            $("#send-btn").prop("disabled", true);
            connect();
        } else {
            console.error('No name entered');
        }
    });

    $("#send-btn").click(() => {
        if (localStorage.getItem("name") && stompClient.connected) {
            sendMessage();
        } else {
            console.error('No name in localStorage before sending message or stompClient is not connected');
        }
    });

    $("#logout").click(() => {
        localStorage.removeItem("name");
        if (stompClient !== null) {
            stompClient.disconnect();
            $("#name-from").removeClass('d-none');
            $("#chat-room").addClass('d-none');
            console.log(stompClient);
        }
    });
});
