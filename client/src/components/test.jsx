const Test = () => {
  const handleStartBroadcast = () => {
    window.location.href = "https://192.168.205.88:5000/broadcast";
  };

  const handleViewBroadcast = () => {
    window.location.href = "https://192.168.205.88:5000/view";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Broadcast Control Panel</h1>
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleStartBroadcast}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold
                     hover:bg-blue-600 transform hover:scale-105 transition-all
                     duration-200 shadow-md"
          >
            Start Broadcast
          </button>
          <button
            onClick={handleViewBroadcast}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold
                     hover:bg-green-600 transform hover:scale-105 transition-all
                     duration-200 shadow-md"
          >
            View Broadcast
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;
