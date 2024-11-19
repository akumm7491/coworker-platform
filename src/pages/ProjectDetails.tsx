import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div>
      <h1>Project Details</h1>
      <p>Project ID: {projectId}</p>
      {/* Add your project details content here */}
    </div>
  );
};

export default ProjectDetails;
