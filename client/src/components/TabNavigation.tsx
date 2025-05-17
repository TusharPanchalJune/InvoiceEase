import React from "react";

interface TabNavigationProps {
  activeTab: "csv" | "manual";
  setActiveTab: (tab: "csv" | "manual") => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab("csv")}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === "csv"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          aria-current={activeTab === "csv" ? "page" : undefined}
        >
          Generate from CSV
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === "manual"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          aria-current={activeTab === "manual" ? "page" : undefined}
        >
          Generate Manually
        </button>
      </nav>
    </div>
  );
};

export default TabNavigation;
