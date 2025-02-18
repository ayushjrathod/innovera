import { Radio, Users, Video } from "lucide-react";

const BroadcastControlPanel = () => {
  const handleStartBroadcast = () => {
    window.location.href = "https://192.168.205.88:5000/broadcast";
  };

  const handleViewBroadcast = () => {
    window.location.href = "https://192.168.205.88:5000/view";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6 max-w-md w-full">
        <div className="text-center">
          <Radio className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Broadcast Control Panel</h1>
          <p className="text-gray-600">Manage your broadcast sessions</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleStartBroadcast}
            className="w-full px-6 py-3 text-white rounded-lg font-semibold
                       bg-black transform hover:scale-105 transition-all
                       duration-200 shadow-md flex items-center justify-center space-x-2"
          >
            <Video className="w-5 h-5" />
            <span>Start Broadcast</span>
          </button>
          <button
            onClick={handleViewBroadcast}
            className="w-full px-6 py-3 text-white rounded-lg font-semibold
                       bg-black transform hover:scale-105 transition-all
                       duration-200 shadow-md flex items-center justify-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>View Broadcast</span>
          </button>
        </div>
        <div className="text-center text-sm text-gray-500">
          <p>Make sure you have the necessary permissions before starting a broadcast.</p>
        </div>
      </div>
    </div>
  );
};

export default BroadcastControlPanel;
