import React from "react";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

const PageHeader: React.FC<Props> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 bg-white px-4 py-5 sm:px-6 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
