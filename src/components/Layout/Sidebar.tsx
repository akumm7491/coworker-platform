import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800">
      <nav className="mt-10">
        <Link to="/" className="flex items-center px-6 py-2 text-gray-100 hover:bg-gray-700">
          Dashboard
        </Link>
        <Link to="/agents" className="flex items-center px-6 py-2 text-gray-100 hover:bg-gray-700">
          Agents
        </Link>
        <Link
          to="/projects"
          className="flex items-center px-6 py-2 text-gray-100 hover:bg-gray-700"
        >
          Projects
        </Link>
        <Link
          to="/analytics"
          className="flex items-center px-6 py-2 text-gray-100 hover:bg-gray-700"
        >
          Analytics
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
