
const socket = io('https://vshare-duj6.onrender.com/');
let roomId;
let receiverConnected = false;
let fileSelected = false;

// Check conditions and enable button
function checkEnableSendButton() {
  const sendBtn = document.getElementById('send-file-btn');
  if (receiverConnected && fileSelected) {
    sendBtn.disabled = false;
    sendBtn.innerText = "Send File";
  } else {
    sendBtn.disabled = true;
  }
}

// Create Room
document.getElementById('create-room-btn').addEventListener('click', () => {
  roomId = Math.random().toString(36).substring(2, 9);
  document.getElementById('room-id').innerText = "Room ID: " + roomId;
  socket.emit('sender-join', { uid: roomId });
});

// File Selected
document.getElementById('file-input').addEventListener('change', (event) => {
  fileSelected = event.target.files.length > 0;
  checkEnableSendButton();
});

// Receiver Connected
socket.on("init", (data) => {
  if (data.uid === roomId) {
    receiverConnected = true;
    document.getElementById("connected").innerText = "Receiver Connected!";
    document.getElementById("connected").style.color = "green";
    checkEnableSendButton();
    console.log("Receiver connected!");
  }
});

// Send File
document.getElementById('send-file-btn').addEventListener('click', () => {
  const file = document.getElementById('file-input').files[0];
  if (!file) {
    alert("Please select a file first!");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const fileData = reader.result;
    const metadata = {
      filename: file.name,
      total_buffer_size: fileData.byteLength,
      uid: roomId
    };

    socket.emit('file-meta', { uid: roomId, metadata });

    let chunkSize = 1024;
    let start = 0;
    let end = chunkSize;
    let sentBytes = 0;

    document.getElementById("send-file-btn").disabled = true;
    document.getElementById("send-file-btn").innerText = "Sending 0%";

    function sendChunks() {
      if (start < fileData.byteLength) {
        const chunk = fileData.slice(start, end);
        socket.emit('file-raw', { uid: roomId, buffer: chunk });

        sentBytes += chunk.byteLength;
        let percent = Math.floor((sentBytes / fileData.byteLength) * 100);
        document.getElementById('send-file-btn').innerText = `Sending ${percent}%`;

        start = end;
        end = Math.min(end + chunkSize, fileData.byteLength);

        setTimeout(sendChunks, 100);
      } else {
        document.getElementById('send-file-btn').innerText = "Send File";
        document.getElementById('send-file-btn').disabled = false;
        alert("File sent successfully!");
      }
    }

    sendChunks();
  };

  reader.readAsArrayBuffer(file);
});
