import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus } from 'lucide-react';
import Breadcrumb from '../_global/Breadcrumb';
import { ProjectsService } from '../../services/projects/projects.service';
import { type CreateProjectData } from '../../services/projects/project.types';

interface BudgetItem {
  id: string;
  name: string;
  amount: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

const AddNewProject: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const projectsService = new ProjectsService();
  
  const [formData, setFormData] = useState({
    projectName: '',
    category: '',
    projectDescription: '',
    startDate: '',
    endDate: '',
    priorityLevel: 'Medium',
    totalBudget: '',
    fundingSource: '',
    projectManager: '',
    expectedBeneficiaries: '',
    teamDepartment: 'All Departments',
    keyStakeholders: '',
    projectLocation: '',
    successMetrics: '',
    potentialRisks: ''
  });

  const [budgetBreakdown, setBudgetBreakdown] = useState<BudgetItem[]>([
    { id: '1', name: 'Material & Supplies', amount: '000' },
    { id: '2', name: 'Labor & Services', amount: '000' },
    { id: '3', name: 'Equipment', amount: '000' }
  ]);

  const [milestones, setMilestones] = useState([
    { description: '', date: '' }
  ]);

  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const teamMembers = Array.from({ length: 8 }, (_, i) => ({
    id: `member-${i + 1}`,
    name: 'Juan D. Cruz',
    position: 'Barangay Captain',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBudgetChange = (id: string, field: 'name' | 'amount', value: string) => {
    setBudgetBreakdown(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addBudgetItem = () => {
    const newId = Date.now().toString();
    setBudgetBreakdown(prev => [
      ...prev,
      { id: newId, name: '', amount: '000' }
    ]);
  };

  const removeBudgetItem = (id: string) => {
    setBudgetBreakdown(prev => prev.filter(item => item.id !== id));
  };

  const addMilestone = () => {
    setMilestones([...milestones, { description: '', date: '' }]);
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = milestones.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    );
    setMilestones(updated);
  };

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllVisible = () => {
    const allIds = teamMembers.map(member => member.id);
    setSelectedTeamMembers(allIds);
  };

  const clearAll = () => {
    setSelectedTeamMembers([]);
  };

  const calculateTotal = () => {
    return budgetBreakdown.reduce((total, item) => {
      const amount = parseInt(item.amount) || 0;
      return total + amount;
    }, 0);
  };

  // File upload handlers
  const handleFiles = (files: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = Date.now().toString() + i;
      
      newFiles.push({
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        file
      });
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Map frontend form data to backend format
      const projectData: CreateProjectData = {
        title: formData.projectName,
        category: formData.category,
        description: formData.projectDescription,
        budget: formData.totalBudget,
        status: 'Pending',
        startDate: formData.startDate || null,
        completedDate: null,
        priority: formData.priorityLevel.toLowerCase() as 'low' | 'medium' | 'high',
        teamSize: parseInt(formData.expectedBeneficiaries) || 0,
      };

      // Submit to backend
      const response = await projectsService.createProject(projectData);
      
      if (response.data) {
        console.log('Project created successfully:', response.data);
        // Navigate back to projects after successful submission
        navigate('/projects');
      } else {
        throw new Error('Failed to create project');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-slide-in-up { 
          opacity: 0;
          animation: slideInUp 0.4s ease-out forwards; 
        }
        .animate-fade-in { 
          opacity: 0;
          animation: fadeIn 0.3s ease-out forwards; 
        }
        .animate-slide-in-right { 
          opacity: 0;
          animation: slideInRight 0.3s ease-out forwards; 
        }
      `}</style>

      <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
        {/* Automatic Breadcrumbs */}
        <Breadcrumb isLoaded={isLoaded} />        {/* Header */}
        <div className="mb-6 animate-slide-in-up">
          <h1 className="text-2xl font-bold text-gray-900 pl-0">Add New Project</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-slide-in-up" style={{animationDelay: '0.1s'}}>
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="animate-slide-in-right" style={{animationDelay: '0.2s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="Enter project name here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
                  required
                />
              </div>

              <div className="animate-slide-in-right" style={{animationDelay: '0.3s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200 cursor-pointer"
                  title="Select category"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Community">Community</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Environment">Environment</option>
                </select>
              </div>

              <div className="md:col-span-2 animate-slide-in-right" style={{animationDelay: '0.4s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of the project: objectives, scope and expected outcomes"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Timeline and Priority */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Timeline and Priority</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="animate-slide-in-right" style={{animationDelay: '0.5s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  placeholder="dd/mm/yyyy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200 cursor-pointer"
                  required
                />
              </div>

              <div className="animate-slide-in-right" style={{animationDelay: '0.6s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  placeholder="dd/mm/yyyy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200 cursor-pointer"
                  required
                />
              </div>

              <div className="animate-slide-in-right" style={{animationDelay: '0.7s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level *
                </label>
                <div className="flex space-x-2">
                  {['High', 'Medium', 'Low'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priorityLevel: priority }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                        formData.priorityLevel === priority
                          ? priority === 'High' ? 'bg-red-100 text-red-800' : 
                            priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Define Project Milestones */}
            <div className="animate-slide-in-right" style={{animationDelay: '0.8s'}}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Define Project Milestones *
              </label>
              <p className="text-sm text-gray-500 mb-4">Add key milestones and target dates for your projects</p>
              
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Milestone description"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
                    />
                    <input
                      type="date"
                      placeholder="dd/mm/yyyy"
                      value={milestone.date}
                      onChange={(e) => updateMilestone(index, 'date', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200 cursor-pointer"
                    />
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-smblue-400 hover:text-smblue-400/90 text-sm font-medium flex items-center space-x-1 transition-colors duration-200 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Budget Information */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Budget Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="animate-slide-in-right" style={{animationDelay: '0.9s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Budget *
                </label>
                <input
                  type="text"
                  name="totalBudget"
                  value={formData.totalBudget}
                  onChange={handleInputChange}
                  placeholder="₱ 000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
                  required
                />
              </div>

              <div className="animate-slide-in-right" style={{animationDelay: '1.0s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Source *
                </label>
                <select
                  name="fundingSource"
                  value={formData.fundingSource}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200 cursor-pointer"
                  title="Select funding source"
                  required
                >
                  <option value="">Select Funding Source</option>
                  <option value="Barangay Fund">Barangay Fund</option>
                  <option value="Government Grant">Government Grant</option>
                  <option value="Private Donation">Private Donation</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="animate-slide-in-right" style={{animationDelay: '1.1s'}}>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Budget Breakdown
              </label>
              
              <div className="space-y-4">
                {budgetBreakdown.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      placeholder="Budget item name"
                      value={item.name}
                      onChange={(e) => handleBudgetChange(item.id, 'name', e.target.value)}
                      className="flex-1 mr-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
                    />
                    <div className="flex items-center space-x-2">
                      <span>₱</span>
                      <input
                        type="text"
                        value={item.amount}
                        onChange={(e) => handleBudgetChange(item.id, 'amount', e.target.value)}
                        className="w-24 px-2 py-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeBudgetItem(item.id)}
                        className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-all duration-200 cursor-pointer"
                        disabled={budgetBreakdown.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addBudgetItem}
                  className="text-smblue-400 hover:text-smblue-400/90 text-sm font-medium flex items-center space-x-1 transition-colors duration-200 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Item</span>
                </button>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Estimated</span>
                    <span className="font-semibold text-lg text-smblue-400">₱ {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Team & Stakeholders */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Project Team & Stakeholders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="animate-slide-in-right" style={{animationDelay: '1.2s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Manager *
                </label>
                <select
                  name="projectManager"
                  value={formData.projectManager}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200 cursor-pointer"
                  title="Select project manager"
                  required
                >
                  <option value="">Select Project Manager</option>
                  <option value="Juan D. Cruz">Juan D. Cruz</option>
                  <option value="Maria Santos">Maria Santos</option>
                  <option value="Jose Reyes">Jose Reyes</option>
                </select>
              </div>

              <div className="animate-slide-in-right" style={{animationDelay: '1.3s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Beneficiaries
                </label>
                <input
                  type="text"
                  name="expectedBeneficiaries"
                  value={formData.expectedBeneficiaries}
                  onChange={handleInputChange}
                  placeholder="Number of residents who will benefit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Team Members */}
            <div className="animate-slide-in-right" style={{animationDelay: '1.4s'}}>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Team Members
              </label>
              
              <div className="flex items-center justify-between mb-4">
                <select
                  name="teamDepartment"
                  value={formData.teamDepartment}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200 cursor-pointer"
                  title="Select department"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={selectAllVisible}
                    className="px-3 py-2 bg-smblue-400 text-white rounded-lg text-sm hover:bg-smblue-400/90 transition-all duration-200 cursor-pointer"
                  >
                    Select All Visible
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {teamMembers.map((member, index) => (
                  <div
                    key={member.id}
                    onClick={() => toggleTeamMember(member.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 animate-slide-in-right ${
                      selectedTeamMembers.includes(member.id)
                        ? 'border-smblue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{animationDelay: `${1.5 + index * 0.1}s`}}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Stakeholders */}
            <div className="mt-6 animate-slide-in-right" style={{animationDelay: '2.3s'}}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Stakeholders
              </label>
              <p className="text-sm text-gray-500 mb-4">List key stakeholders, partners, or beneficiaries involved in this project</p>
              <textarea
                name="keyStakeholders"
                value={formData.keyStakeholders}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Additional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="animate-slide-in-right" style={{animationDelay: '2.4s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Documents
                </label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                    dragActive 
                      ? 'border-smblue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-smblue-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="text-smblue-400 hover:text-blue-700 font-medium transition-colors duration-200">
                      Choose Files
                    </span> 
                    <span> to browse or drag and drop</span>
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB each)</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {/* Uploaded Files Display */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-smblue-100 rounded flex items-center justify-center">
                            <Upload className="w-4 h-4 text-smblue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="text-red-400 hover:text-red-600 p-1 rounded transition-colors duration-200 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="animate-slide-in-right" style={{animationDelay: '2.5s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Location
                </label>
                <input
                  type="text"
                  name="projectLocation"
                  value={formData.projectLocation}
                  onChange={handleInputChange}
                  placeholder="Specify location within the barangay"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
                />
              </div>

              <div className="md:col-span-2 animate-slide-in-right" style={{animationDelay: '2.6s'}}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Metrics
                </label>
                <textarea
                  name="successMetrics"
                  value={formData.successMetrics}
                  onChange={handleInputChange}
                  placeholder="How will you measure the success of this project? (e.g. completion rate, beneficiary satisfaction, measurable outcomes)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Potential Risks & Challenges */}
          <div className="mb-8 animate-slide-in-right" style={{animationDelay: '2.7s'}}>
            <h2 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Potential Risks & Challenges</h2>
            
            <textarea
              name="potentialRisks"
              value={formData.potentialRisks}
              onChange={handleInputChange}
              placeholder="Identify potential risks, challenges, or obstacles and mitigation strategies"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 animate-slide-in-right" style={{animationDelay: '2.8s'}}>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer ${
                loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-smblue-400 hover:bg-smblue-400/90 text-white'
              }`}
            >
              {loading ? 'Creating Project...' : 'Submit Project'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddNewProject;