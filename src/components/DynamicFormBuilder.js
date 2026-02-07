import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const DynamicFormBuilder = ({ formId, title }) => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // Load existing schema
  useEffect(() => {
    const fetchSchema = async () => {
      const { data } = await supabase
        .from('form_configs')
        .select('schema')
        .eq('id', formId)
        .single();
      
      if (data?.schema) {
        setFields(data.schema);
      }
      setLoading(false);
    };
    fetchSchema();
  }, [formId]);

  const addField = () => {
    setFields([...fields, { 
      id: Date.now().toString(), 
      label: 'New Question', 
      type: 'text', 
      options: '' 
    }]);
  };

  const updateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const moveField = (index, direction) => {
    if (index + direction < 0 || index + direction >= fields.length) return;
    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[index + direction];
    newFields[index + direction] = temp;
    setFields(newFields);
  };

  const saveForm = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('form_configs')
      .upsert({ id: formId, schema: fields });

    if (error) alert('Error saving form: ' + error.message);
    else alert('Form saved successfully!');
    setLoading(false);
  };

  const toggleJsonMode = () => {
    if (jsonMode) {
      try {
        const parsed = JSON.parse(jsonInput);
        if (!Array.isArray(parsed)) throw new Error("Schema must be an array");
        setFields(parsed);
        setJsonMode(false);
      } catch (e) {
        alert("Invalid JSON: " + e.message);
      }
    } else {
      setJsonInput(JSON.stringify(fields, null, 2));
      setJsonMode(true);
    }
  };

  if (loading) return <div className="p-4">Loading Form Config...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">{title} Builder</h3>
        <div className="flex gap-2">
          <button onClick={toggleJsonMode} className="text-blue-600 font-bold text-xs underline px-2">
            {jsonMode ? 'Switch to Visual Editor' : 'Bulk Edit JSON'}
          </button>
          <button onClick={saveForm} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700">
            Save Form
          </button>
        </div>
      </div>

      {jsonMode ? (
        <textarea className="w-full h-96 p-4 bg-slate-50 font-mono text-xs border rounded-lg" value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} />
      ) : (
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-3">
            <div className="flex gap-3">
              <input 
                type="text" 
                value={field.label} 
                onChange={(e) => updateField(index, 'label', e.target.value)}
                className="flex-1 p-2 border rounded font-semibold"
                placeholder="Question Label"
              />
              <select 
                value={field.type} 
                onChange={(e) => updateField(index, 'type', e.target.value)}
                className="p-2 border rounded"
              >
                <option value="text">Text Input</option>
                <option value="number">Number Input</option>
                <option value="date">Date (Calendar)</option>
                <option value="dropdown">Dropdown</option>
                <option value="textarea">Long Text</option>
                <option value="file">File Upload (Image/PDF)</option>
              </select>
              <div className="flex items-center gap-1">
                <button onClick={() => moveField(index, -1)} disabled={index === 0} className="text-slate-400 hover:text-blue-600 px-1 disabled:opacity-30 font-bold">
                  ↑
                </button>
                <button onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} className="text-slate-400 hover:text-blue-600 px-1 disabled:opacity-30 font-bold">
                  ↓
                </button>
                <button onClick={() => removeField(index)} className="text-red-500 hover:text-red-700 px-2"><i className="fas fa-trash"></i></button>
              </div>
            </div>

            {field.type === 'dropdown' && (
              <div>
                <textarea 
                  value={field.options} 
                  onChange={(e) => updateField(index, 'options', e.target.value)}
                  className="w-full p-2 border rounded text-sm h-20"
                  placeholder="Options (comma separated, e.g. Math, Science, English)"
                />
                <button 
                  onClick={() => {
                    const pasted = prompt("Paste your list here (one item per line):");
                    if (pasted) {
                      const formatted = pasted.split(/\n/).map(s => s.trim()).filter(Boolean).join(', ');
                      updateField(index, 'options', formatted);
                    }
                  }}
                  className="text-xs text-blue-600 font-bold underline mt-1"
                >
                  + Bulk Upload Options (Paste List)
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {!jsonMode && (
        <button onClick={addField} className="mt-6 w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 font-bold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all">
          + Add New Section/Question
        </button>
      )}
    </div>
  );
};

export default DynamicFormBuilder;
