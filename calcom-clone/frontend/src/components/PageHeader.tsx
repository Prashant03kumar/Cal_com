import React from "react";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

const PageHeader: React.FC<Props> = ({ title, description, action }) => {
  return (
    <div className="flex justify-between items-start border-b border-gray-200 px-6 py-5 bg-white">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div>{action}</div>
    </div>
  );
};

export default PageHeader;
