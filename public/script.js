const socket = io('/');
const videoGrid = document.getElementById('video-grid');

var peer = new Peer();

var id = Math.floor(1E7 * Math.random()).toString(16);

let screenShareStream;

let myVideoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', userId => {

        connecToNewUser(userId, stream);
        console.log('new user joined', userId)
    })

    //input
    let text = $('input')
    //press enter
    $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
            console.log(text.val())
            socket.emit('message', text.val());
            text.val('')
        }
    });

    socket.on('createMessage', message => {
        id = Math.floor(1E7 * Math.random()).toString(16);
        console.log(message)
        $("ul").append(`<li class="message"><b>${id}</b><br/>${message}</li>`)
        scrollToBottom()
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
    console.log(userId, ' leave')
})

peer.on('open', id => {
    //id = Math.floor(1E7 * Math.random()).toString(16);
    socket.emit('join-room', ROOM_ID, id);
    console.log('id ', id)
})


function connecToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })

    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    id = Math.floor(1E7 * Math.random()).toString(16);
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })

    videoGrid.append(id, video);
}
const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

// mute our video
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}


const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}


const shareScreen = async () => {
    const socket = io('/')
    const videoGrid = document.getElementById('capture')
    var myPeer = new Peer()
    const peers = {}
    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    }).then(stream => {
        myPeer.on('call', call => {
            call.answer(stream)
            call.on('stream', userVideoStream => {
                addVideoStream(userVideoStream)
            })
        })

        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream)
        })


    })

    socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close()
    })

    myPeer.on('open', id => {
        socket.emit('join-room', ROOM_ID, id)
    })

    function connectToNewUser(userId, stream) {

        const call = myPeer.call(userId, stream)
        const video2 = document.createElement('video')

        call.on('close', () => {
            video2.remove()
        })

        peers[userId] = call
    }

    function addVideoStream(video2, stream) {
        video2.srcObject = stream
        video2.addEventListener('loadedmetadata', () => {
            video2.play()
        })
        videoGrid.append(video2)
    }
};

const setMuteButton = () => {
    const html = `
    <i class="fas fa-volume-up"></i
    <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-volume-mute"></i>
    <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}


const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}
function closeBtnClicked() {
    window.close();
    if (peers[userId]) peers[userId].close()
    console.log(userId, ' leave')
}