const socket  = io('/');


const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

// Peer js
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    console.log("Received New stream from media");
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });

    let text = $('input');

    $('html').keydown((e) => {
        if(e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('');
        }
    });
    
    socket.on('create-message', message => {
        console.log("message from server", message);
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom();
    });

    setMuteButton(myVideoStream.getAudioTracks()[0].enabled);
    setVideoButton(myVideoStream.getVideoTracks()[0].enabled);

}).catch(err => {
    console.log("Media Device Error", err);
});


peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});


const connectToNewUser = (userId, stream) => {
    console.log("New User: ", userId);
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
}

const addVideoStream = (video, stream) => {
    console.log("Adding new stream");
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
};

const scrollToBottom = () => {
    var d = $('.main__chat__window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    console.log(myVideoStream);
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    myVideoStream.getAudioTracks()[0].enabled = !enabled;
    setMuteButton(!enabled); 
}

const setMuteButton = (isMute) => {
    let html;
    if (isMute) {
        html = `
            <i class='fas fa-microphone'></i>
            <span>Mute</span>
        `
    } else {
        html = `
            <i class='unmute fas fa-microphone-slash'></i>
            <span>Unmute</span>
        `
    }
    document.querySelector('.main__mute_button').innerHTML = html;
}

const startStopVideo = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    myVideoStream.getVideoTracks()[0].enabled = !enabled;
    setVideoButton(!enabled);  
}

const setVideoButton = (isVideoPlaying) => {
    let html;
    if (isVideoPlaying) {
        html = `
            <i class='fas fa-video'></i>
            <span>Stop Video</span>
        `
    } else {
        html = `
            <i class='videoStop fas fa-video-slash'></i>
            <span>Start Video</span>
        `
    }
    document.querySelector('.main__video_button').innerHTML = html;
}