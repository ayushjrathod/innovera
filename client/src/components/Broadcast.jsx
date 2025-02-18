import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const Broadcast = () => {
  const [status, setStatus] = useState("");
  const [roomId, setRoomId] = useState("");
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    socketRef.current = io("https://localhost:5000", {
      rejectUnauthorized: false, // Accept self-signed certificates
      secure: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    // integrated socket events from broadcast.html
    socketRef.current.on("connect", () => setStatus("Connected to server"));
    socketRef.current.on("connect_error", (error) => setStatus("Connection error: " + error.message));
    setupSocketListeners();
    return () => cleanup();
  }, []);

  const setupSocketListeners = () => {
    const socket = socketRef.current;

    socket.on("viewer_joined", async (data) => {
      const viewerId = data.viewer_id;
      setStatus(`Viewer joined: ${viewerId}`);
      createPeerConnection(viewerId);
    });

    socket.on("answer", async (data) => {
      const { viewer_id, answer } = data;
      try {
        await peerConnectionsRef.current[viewer_id]?.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        setStatus(`Error setting remote description: ${error.message}`);
      }
    });

    socket.on("ice_candidate", async (data) => {
      const { viewer_id, candidate } = data;
      try {
        await peerConnectionsRef.current[viewer_id]?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        setStatus(`Error adding ICE candidate: ${error.message}`);
      }
    });
  };

  const createPeerConnection = async (viewerId) => {
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionsRef.current[viewerId] = peerConnection;

    localStreamRef.current.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStreamRef.current);
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice_candidate", {
          room: roomId,
          candidate: event.candidate,
          viewer_id: viewerId,
        });
      }
    };

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socketRef.current.emit("offer", {
        room: roomId,
        offer: offer,
        viewer_id: viewerId,
      });
    } catch (error) {
      setStatus(`Error creating offer: ${error.message}`);
    }
  };

  const startBroadcasting = async () => {
    if (!roomId) {
      setStatus("Please enter a room ID");
      return;
    }

    if (!navigator.mediaDevices) {
      setStatus(
        "MediaDevices API is not supported. Please use HTTPS or enable insecure media capture in your browser settings."
      );
      return;
    }

    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = localStreamRef.current;
      socketRef.current.emit("create", { room: roomId });
      setStatus("Starting broadcast...");
    } catch (error) {
      if (error.name === "NotAllowedError") {
        setStatus("Permission denied. Please allow camera and microphone access.");
      } else if (error.name === "NotFoundError") {
        setStatus("Camera or microphone not found. Please check your devices.");
      } else {
        setStatus(`Error accessing media devices: ${error.message}`);
      }
    }
  };

  const cleanup = () => {
    socketRef.current?.close();
    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Broadcast</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button onClick={startBroadcasting} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Start Broadcasting
        </button>
      </div>
      <div className="text-gray-600 mb-4">{status}</div>
      <video ref={localVideoRef} autoPlay playsInline muted className="w-full rounded-lg" />
    </div>
  );
};

export default Broadcast;
