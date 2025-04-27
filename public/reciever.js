const socket = io();

let fileShare = {
  metadata: null,
  transmitted: [],
  buffer_size: 1024,
};

let percentage = 0;
let receivedSize = 0;

const connectBtn = document.getElementById('connect-btn');
const downloadBtn = document.getElementById('download-btn');
const joinIdInput = document.getElementById('join-id');

// Connect to room
connectBtn.addEventListener('click', () => {
  const roomId = joinIdInput.value.trim();
  if (roomId) {
    connectBtn.innerText = "Connecting...";
    socket.emit('receiver-join', { uid: roomId, sender_uid: roomId });
    console.log('Connecting to room:', roomId);
    connectBtn.disabled = true;
    connectBtn.innerText = "Connected ✅";
  } else {
    alert('Please enter a valid Room ID');
  }
});

// Receive file metadata
socket.on('fs-meta', (metadata) => {
  fileShare.metadata = metadata;
  fileShare.transmitted = [];
  receivedSize = 0;
  percentage = 0;
  downloadBtn.disabled = true;
  downloadBtn.innerText = `Downloading... 0%`;
  console.log('File metadata received:', metadata);
});

// Receive file chunks
socket.on('fs-raw', (buffer) => {
  fileShare.transmitted.push(buffer);
  receivedSize += buffer.byteLength;
  percentage = Math.floor((receivedSize / fileShare.metadata.total_buffer_size) * 100);
  if (percentage > 100) percentage = 100;

  downloadBtn.innerText = `Downloading... ${percentage}%`;

  if (receivedSize >= fileShare.metadata.total_buffer_size) {
    const blob = new Blob(fileShare.transmitted);
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileShare.metadata.filename;
    downloadLink.click();

    downloadBtn.innerText = `Downloaded ✅`;
    downloadBtn.disabled = true;
    downloadBtn.style.backgroundColor = "#4CAF50";
  }
});
