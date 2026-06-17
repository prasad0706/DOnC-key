import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 text-slate-800 dark:bg-[#090d16] dark:text-slate-200">
      {/* Fixed Sidebar */}
      <div className="flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Main content area with independent scrolling */}
      <div className="flex-1 h-full overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
