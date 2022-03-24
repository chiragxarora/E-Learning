
let rtc = {
    localAudioTrack: null,
    localVideoTrack: null,
};

const fetchToken = async (uid, channel, role) => {
    const res = await axios.post('http://localhost:4444/fetch-token', {
        uid,
        channel,
        role
    }, {
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        }
    })
    token = res.data.token;
    
    return token;
}

let appID = "fd71747548e148de852032e31386f6bc";
let channel = "channel1";
let token = "006fd71747548e148de852032e31386f6bcIAA9Dxc07FoOPPdxaSYeKy3qBLAzBbFSutHxpFb5mlSuAwrCxmsAAAAAEACYlhMNFbk9YgEAAQAVuT1i";

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}

const str = window.location.href
const roomName = str.substring(str.lastIndexOf("r=")+2)

remoteUsers.me = roomName;

let handleUserJoined = async (user, mediaType) => {
    let cuid = user.uid;
    let res = await axios.get('http://localhost:4444/get-users');
    if(res.data.obj[cuid]!==roomName){
        return;
    }
    remoteUsers[user.uid] = user 
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}


let joinAndDisplayLocalStream = async () => {

    client.on('user-published', handleUserJoined)
    
    client.on('user-left', handleUserLeft)
    
    let UID = await client.join(appID, channel, token, null)
    await axios.post('http://localhost:4444/add-user',{
        uid: UID,
        room: roomName
    })
    alert(UID)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks() 

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)
    
    await client.publish([localTracks[0], localTracks[1]])
}

let joinStream = async () => {
    await joinAndDisplayLocalStream()
    document.getElementById('stream-controls').style.display = 'flex'
}

joinStream();

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    document.getElementById('stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''
    window.location = 'http://localhost:4444'
}

let toggleMic = async (e) => {
    if (localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic on'
        e.target.style.backgroundColor = 'cadetblue'
    }else{
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera on'
        e.target.style.backgroundColor = 'cadetblue'
    }else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)