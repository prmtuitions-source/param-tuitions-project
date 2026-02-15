import React, { useState } from 'react';
import DynamicFormBuilder from '../shared/components/DynamicFormBuilder';
import Header from '../shared/components/Header';

const SuperAdminForms = () => {
  const [activeTab, setActiveTab] = useState('institute_request');

  const tabs = [
    { id: 'institute_request', label: 'Institute Request Form' },
    { id: 'parent_request', label: 'Parent Request Form' },
    { id: 'teacher_registration_1', label: 'Teacher Reg Part 1' },
    { id: 'teacher_registration_2', label: 'Teacher Reg Part 2' },
    { id: 'teacher_documents', label: 'Document Submission' },
    { id: 'teacher_agreement', label: 'Teacher Agreement' }
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-slate-800 uppercase mb-8">Form Management</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Builder Area */}
        <DynamicFormBuilder 
          formId={activeTab} 
          title={tabs.find(t => t.id === activeTab)?.label} 
        />
      </div>
    </div>
  );
};

export default SuperAdminForms;
