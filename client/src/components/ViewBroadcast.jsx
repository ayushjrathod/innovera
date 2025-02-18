import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const ViewBroadcast = () => {
  const [status, setStatus] = useState("");
  const [roomId, setRoomId] = useState("");
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    // Updated socket connection URL without forcing websocket transport
    socketRef.current = io("https://localhost:5000");
    // integrated socket events from view.html
    socketRef.current.on("connect", () => setStatus("Connected to server"));
    socketRef.current.on("connect_error", (error) => setStatus("Connection error: " + error.message));
    socketRef.current.on("disconnect", () => setStatus("Disconnected from server"));
    setupSocketListeners();
    return () => cleanup();
  }, []);

  const setupSocketListeners = () => {
    const socket = socketRef.current;

    socket.on("offer", async (data) => {
      try {
        setStatus("Received offer from broadcaster");
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        // Updated the payload to include viewer_id for proper integration with Broadcast.jsx and app.py
        socket.emit("answer", {
          room: roomId,
          answer: answer,
          viewer_id: socketRef.current.id,
        });
        setStatus("Sent answer to broadcaster");
      } catch (error) {
        setStatus(`Error handling offer: ${error.message}`);
      }
    });

    socket.on("ice_candidate", async (data) => {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        setStatus("Added ICE candidate");
      } catch (error) {
        setStatus(`Error adding ICE candidate: ${error.message}`);
      }
    });
  };

  const joinRoom = () => {
    if (!roomId) {
      setStatus("Please enter a room ID");
      return;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    peerConnectionRef.current = new RTCPeerConnection(configuration);

    peerConnectionRef.current.ontrack = (event) => {
      setStatus("Received media stream");
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice_candidate", {
          room: roomId,
          candidate: event.candidate,
        });
      }
    };

    socketRef.current.emit("join", { room: roomId });
    setStatus(`Connecting to room: ${roomId}`);
  };

  const cleanup = () => {
    socketRef.current?.close();
    peerConnectionRef.current?.close();
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">View Broadcast</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button onClick={joinRoom} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Join
        </button>
      </div>
      <div className="text-gray-600 mb-4">{status}</div>
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-lg" />
    </div>
  );
};

export default ViewBroadcast;
