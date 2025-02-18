import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md text-center">
      <h1 className="text-3xl font-bold mb-6">Video Conference</h1>
      <div className="flex justify-center gap-4">
        <Link to="/broadcast" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Start Broadcasting
        </Link>
        <Link to="/view" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          View Broadcast
        </Link>
      </div>
    </div>
  );
};

export default Home;
