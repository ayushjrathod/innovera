import asyncio
import cv2
import json
import ssl
import logging
from aiortc import RTCIceCandidate, RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.contrib.media import MediaPlayer, MediaRecorder
import websockets
import av
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebRTCViewer:
    def __init__(self, server_url="wss://localhost:5000/socket.io/?EIO=4&transport=websocket"):
        self.server_url = server_url
        self.room_id = "test"
        self.connected = False
        self.pc = None
        
        # Create SSL context that accepts self-signed certificates
        self.ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE

    def create_socket_message(self, event, data):
        """Create properly formatted Socket.IO message"""
        return f'42["{event}",{json.dumps(data)}]'

    async def handle_track(self, track):
        """Handle incoming media tracks"""
        logger.info(f"Receiving {track.kind} track")
        
        if track.kind == "video":
            while True:
                try:
                    frame = await track.recv()
                    # Convert frame to numpy array for OpenCV
                    img = frame.to_ndarray(format="bgr24")
                    
                    # Display the frame
                    cv2.imshow("WebRTC Stream", img)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                except Exception as e:
                    logger.error(f"Error receiving frame: {e}")
                    break
            
            cv2.destroyAllWindows()

    async def connect_and_display(self):
        try:
            async with websockets.connect(self.server_url, ssl=self.ssl_context) as websocket:
                logger.info("Connected to WebSocket server")
                
                # Handle Socket.IO handshake
                handshake = await websocket.recv()
                logger.info(f"Socket.IO handshake received: {handshake}")
                
                # Send Socket.IO connection message
                await websocket.send("40")
                logger.info("Sent Socket.IO connect message")
                
                # Wait for connection acknowledgment
                while True:
                    response = await websocket.recv()
                    logger.info(f"Received: {response}")
                    if response.startswith("40"):
                        self.connected = True
                        logger.info("Socket.IO connection established")
                        break
                
                if self.connected:
                    # Create peer connection
                    self.pc = RTCPeerConnection()
                    
                    # Add track handlers
                    @self.pc.on("track")
                    async def on_track(track):
                        await self.handle_track(track)
                    
                    # Join room
                    join_message = self.create_socket_message("join", {"room": self.room_id})
                    await websocket.send(join_message)
                    logger.info(f"Sent join request for room: {self.room_id}")
                    
                    # Listen for events
                    try:
                        while True:
                            message = await websocket.recv()
                            logger.info(f"Received message: {message}")
                            
                            if '"offer"' in message:
                                # Parse offer from message
                                msg_data = json.loads(message[2:])
                                offer = RTCSessionDescription(
                                    sdp=msg_data[1]["offer"]["sdp"],
                                    type=msg_data[1]["offer"]["type"]
                                )
                                
                                # Set remote description
                                await self.pc.setRemoteDescription(offer)
                                
                                # Create and send answer
                                answer = await self.pc.createAnswer()
                                await self.pc.setLocalDescription(answer)
                                
                                answer_message = self.create_socket_message("answer", {
                                    "room": self.room_id,
                                    "answer": {
                                        "type": answer.type,
                                        "sdp": answer.sdp
                                    }
                                })
                                await websocket.send(answer_message)
                            
                            elif '"ice_candidate"' in message:
                                msg_data = json.loads(message[2:])
                                candidate_data = msg_data[1]["candidate"]
                                
                                try:
                                    if candidate_data["candidate"]:  # Ensure it's not empty
                                        rtc_candidate = RTCIceCandidate(
                                            sdpMid=str(candidate_data["sdpMid"]),
                                            sdpMLineIndex=int(candidate_data["sdpMLineIndex"]),
                                            foundation="",
                                            component=1,
                                            protocol="udp",
                                            priority=0,
                                            ip=candidate_data["candidate"].split(" ")[4],
                                            port=int(candidate_data["candidate"].split(" ")[5]),
                                            type="srflx",
                                            # related_address=None,
                                            # related_port=None
                                        )
                                        await self.pc.addIceCandidate(rtc_candidate)
                                        logger.info("Successfully added ICE candidate")
                                    else:
                                        logger.warning("Received an empty ICE candidate, ignoring it.")
                                except Exception as e:
                                    logger.error(f"Error adding ICE candidate: {e}")
                            # Handle ping messages
                            elif message.startswith("2"):
                                await websocket.send("3")  # Send pong response
                    
                    except Exception as e:
                        logger.error(f"Error in message handling: {e}")
                    
                    finally:
                        # Cleanup
                        if self.pc:
                            await self.pc.close()
                        cv2.destroyAllWindows()
                    
        except Exception as e:
            logger.error(f"Error in connection: {e}")
            return False
            
        return True

async def main():
    viewer = WebRTCViewer()
    await viewer.connect_and_display()

if __name__ == "__main__":
    asyncio.run(main())