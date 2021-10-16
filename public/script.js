const socket = io('0.0.0.0')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined,{
    host:'0.0.0.0',
    port:process.env.PORT+1
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(function(stream){
    addVideoStream(myVideo,stream);
    myPeer.on('call',function(call){
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream',function(userVideoStream){
            addVideoStream(video,userVideoStream)
        })
    })
    
    socket.on('user-connected',userId=>{
        setTimeout(()=>{
            connectToNewUser(userId,stream)
        },1000)
    })
})

socket.on('user-disconnected',function(userId){
    if(peers[userId])
    peers[userId].close
})
myPeer.on('open',function(id){
    socket.emit('join-room',ROOM_ID,id)
})

function connectToNewUser(userId,stream){
    const call = myPeer.call(userId,stream)
    const video = document.createElement('video')
    call.on('stream',function(userVideoStream){
        addVideoStream(video,userVideoStream)
    })
    call.on('close',function(){
        video.remove()
    })

    peers[userId] = call
}




function addVideoStream(video,stream){
    video.srcObject= stream;
    video.addEventListener('loadedmetadata',function(){
        video.play()
    })
    videoGrid.append(video)
}