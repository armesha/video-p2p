const startBtn = document.getElementById("startBtn");
const joinBtn = document.getElementById("joinBtn");

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let peer = null;
let localStream = null;
let isInitiator = false;

async function getLocalStream() {
    if (localStream) return localStream;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    localVideo.srcObject = stream;
    localStream = stream;
    return stream;
}

function createPeer(initiator) {
    isInitiator = initiator;
    peer = new SimplePeer({
        initiator,
        trickle: false,
        stream: localStream,
        config: {
            iceServers: [
                { urls: "stun:stun1.l.google.com:19302" },
            ],
        },
    });

    peer.on("signal", data => {
        const sdpBlob = JSON.stringify(data, null, 2);
        const localDesc = document.getElementById("localDesc");
        localDesc.value = sdpBlob;
        console.log("Local signal generated:", data);
    });

    peer.on("connect", () => {
        console.log("Peer connected");
    });

    peer.on("stream", stream => {
        remoteVideo.srcObject = stream;
    });

    peer.on("error", err => {
        console.error("Peer error:", err);
    });
}

function listenForRemoteSignals() {
    const remoteDesc = document.getElementById("remoteDesc");
    function tryApply() {
        if (!peer) return;
        const text = remoteDesc.value.trim();
        if (!text) return;
        const data = JSON.parse(text);
        peer.signal(data);
        remoteDesc.removeEventListener("input", tryApply);
    }
    remoteDesc.addEventListener("input", tryApply);
}

async function startCall() {
    ensureSignalUI();
    await getLocalStream();
    createPeer(true);
    listenForRemoteSignals();
}

async function joinCall() {
    ensureSignalUI();
    await getLocalStream();
    createPeer(false);
    listenForRemoteSignals();
}

startBtn.addEventListener("click", startCall);
joinBtn.addEventListener("click", joinCall);