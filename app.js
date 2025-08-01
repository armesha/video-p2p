const signaling = {
    initiatorOffer: null,
    answererAnswer: null,
    initiatorCandidates: [],
    answererCandidates: [],
};

const startBtn = document.getElementById("startBtn");
const joinBtn = document.getElementById("joinBtn");

const statusEl = document.getElementById("status");

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let peer = null;
let localStream = null;
let isInitiator = false;

function ensureSignalUI() {
    // UI already present in HTML, just return it.
    return document.getElementById("signal-ui");
}

function setStatus(text) {
    statusEl.textContent = text;
    console.log("[STATUS]", text);
}

async function getLocalStream() {
    if (localStream) return localStream;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    localVideo.srcObject = stream;
    localStream = stream;
    setStatus("Camera ready");
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
        setStatus(initiator ? "Offer ready. Copy and send to the other peer." : "Answer ready. Copy and send back to initiator.");
    });

    peer.on("connect", () => {
        setStatus("P2P connected");
        console.log("Peer connected");
    });

    peer.on("stream", stream => {
        remoteVideo.srcObject = stream;
        setStatus("Remote stream received");
    });

    peer.on("error", err => {
        console.error("Peer error:", err);
        setStatus("Peer error - see console");
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
        setStatus("Applied remote description");
        remoteDesc.removeEventListener("input", tryApply);
    }
    remoteDesc.addEventListener("input", tryApply);
}

async function startCall() {
    setStatus("Starting call (initiator)…");
    ensureSignalUI();
    await getLocalStream();
    createPeer(true);
    listenForRemoteSignals();
}

async function joinCall() {
    setStatus("Joining call (answerer)…");
    ensureSignalUI();
    await getLocalStream();
    createPeer(false);
    listenForRemoteSignals();
}

function hangUp() {
    if (peer) {
        peer.destroy();
        peer = null;
    }

    if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        localStream = null;
        localVideo.srcObject = null;
    }

    remoteVideo.srcObject = null;
}

startBtn.addEventListener("click", startCall);
joinBtn.addEventListener("click", joinCall);