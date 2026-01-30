import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { projectsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, GraduationCap, Briefcase, Zap } from 'lucide-react';

interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'essay' | 'report' | 'creative' | 'professional';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
  starterContent: string;
  structure: string[];
  icon: React.ReactNode;
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'argumentative-essay',
    title: 'Argumentative Essay',
    description: 'A structured template for persuasive academic essays with strong thesis statements and counterarguments',
    category: 'academic',
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    tags: ['essay', 'argument', 'thesis'],
    icon: <FileText className="w-5 h-5" />,
    starterContent: `# Argumentative Essay

## Introduction
Hook the reader with a compelling opening...
Background information...
Thesis statement: Your main argument here...

## Body Paragraphs

### Main Point 1
Topic sentence with your first argument...
Evidence and supporting details...
Analysis of evidence...
Concluding sentence...

### Counterargument
Acknowledge opposing viewpoint...
Refute with evidence...
Bridge back to your main argument...

### Main Point 2
Topic sentence with your second argument...
Evidence and supporting details...
Analysis of evidence...
Concluding sentence...

### Main Point 3
Topic sentence with your third argument...
Evidence and supporting details...
Analysis of evidence...
Concluding sentence...

## Conclusion
Restate thesis in new words...
Summarize main points...
Final thought-provoking statement...

## References
[List your academic sources here]`,
    structure: ['Introduction', 'Body Paragraphs', 'Counterargument', 'Conclusion', 'References']
  },
  {
    id: 'research-proposal',
    title: 'Research Proposal',
    description: 'Comprehensive template for academic research proposals with methodology and timeline',
    category: 'academic',
    difficulty: 'advanced',
    estimatedTime: '4-5 hours',
    tags: ['research', 'proposal', 'methodology'],
    icon: <GraduationCap className="w-5 h-5" />,
    starterContent: `# Research Proposal

## Title
[Your research title here]

## Abstract
Brief summary of your research (150-250 words)...

## Introduction
Background and context...
Research problem...
Research questions...
Significance of study...

## Literature Review
Previous research in this area...
Gaps in existing research...
How your study addresses these gaps...

## Methodology
Research design approach...
Participants or data sources...
Data collection methods...
Analysis procedures...

## Expected Results
Hypotheses or expected outcomes...
Potential implications...

## Timeline
[Break down your research into phases with deadlines]

## Budget
[List resources needed for your research]

## References
[Key academic sources for your research]`,
    structure: ['Title', 'Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Expected Results', 'Timeline', 'Budget', 'References']
  },
  {
    id: 'lab-report',
    title: 'Lab Report',
    description: 'Scientific lab report template for experimental research with methods and results',
    category: 'academic',
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    tags: ['lab', 'experimental', 'results'],
    icon: <Zap className="w-5 h-5" />,
    starterContent: `# Lab Report

## Title
[Your experiment title]

## Abstract
Brief summary of experiment, methods, and key findings...

## Introduction
Purpose of the experiment...
Background information...
Hypothesis...

## Materials and Methods
### Materials
[List all equipment and materials used]

### Procedure
Step-by-step description of experimental procedure...

## Results
### Data Collection
Raw data tables or measurements...

### Observations
Qualitative observations during experiment...

### Calculations
Mathematical analysis of the data...

## Discussion
Interpretation of results...
Comparison with hypothesis...
Error analysis...
Implications of findings...

## Conclusion
Summary of key findings...
Answer to research question...

## References
[Academic sources related to your experiment]`,
    structure: ['Title', 'Abstract', 'Introduction', 'Materials and Methods', 'Results', 'Discussion', 'Conclusion', 'References']
  },
  {
    id: 'business-report',
    title: 'Business Report',
    description: 'Professional business report template with executive summary and recommendations',
    category: 'professional',
    difficulty: 'intermediate',
    estimatedTime: '3-4 hours',
    tags: ['business', 'report', 'analysis'],
    icon: <Briefcase className="w-5 h-5" />,
    starterContent: `# Business Report

## Executive Summary
[2-3 paragraph summary of the entire report]

## Introduction
Purpose of the report...
Scope and limitations...

## Methodology
Approach to analysis...
Data sources...
Analytical methods used...

## Findings
[Present your key findings here]

## Analysis
Interpretation of findings...
Trends and patterns identified...

## Conclusions and Recommendations
Main conclusions...
Specific recommendations with action items...

## Appendices
[Additional supporting documents]

## References
[Sources of information cited]`,
    structure: ['Executive Summary', 'Introduction', 'Methodology', 'Findings', 'Analysis', 'Conclusions and Recommendations', 'Appendices', 'References']
  },
  {
    id: 'creative-writing',
    title: 'Creative Writing',
    description: 'Flexible template for creative writing projects with story structure',
    category: 'creative',
    difficulty: 'beginner',
    estimatedTime: '1-2 hours',
    tags: ['creative', 'story', 'narrative'],
    icon: <BookOpen className="w-5 h-5" />,
    starterContent: `# Creative Writing Project

## Story Concept
Working title:
Genre:
Logline:
Theme:

## Characters

### Main Character
Name:
Age:
Background:
Motivation:
Character arc:

### Supporting Characters
[Character profiles for key supporting roles]

## Plot Outline

### Act 1: Setup
Introduction to world and characters...
Inciting incident...

### Act 2: Rising Action
Development of conflicts...
Building tension...

### Act 3: Climax
Peak of the story...
Major confrontation...

### Act 4: Falling Action
Immediate aftermath...
Character decisions...

### Act 5: Resolution
Final outcome...
Character growth...

## Setting
Time period:
Location:
Atmosphere:

## Additional Notes
[Story ideas, themes, motifs, dialogue snippets]`,
    structure: ['Story Concept', 'Characters', 'Plot Outline', 'Setting', 'Additional Notes']
  }
];

export default function ProjectTemplates() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = PROJECT_TEMPLATES.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    const searchMatch = !searchQuery || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && difficultyMatch && searchMatch;
  });

  const handleCreateFromTemplate = async (template: ProjectTemplate) => {
    if (!isAuthenticated) {
      alert('Please log in to create a project');
      return;
    }

    try {
      const { data } = await projectsAPI.create(template.title);
      
      // Save the template content to the project
      await projectsAPI.save(data.id, template.starterContent);
      
      // Navigate to the new project
      window.location.href = `/project/${data.id}`;
    } catch (error) {
      console.error('Failed to create project from template:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Please log in to use project templates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Project Templates</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Start with a structured template for any writing project</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-4">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="essay">Essay</option>
                <option value="report">Report</option>
                <option value="creative">Creative</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zimp-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-right">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {filteredTemplates.length} templates
              </p>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {template.title}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {template.category} • {template.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500">
                      {template.estimatedTime}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {template.description}
                </p>
              </div>

              {/* Structure Preview */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900">
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Structure:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {template.structure.map((section, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded"
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="p-4">
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs rounded border border-zinc-200 dark:border-zinc-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-white dark:bg-zinc-800">
                <Button
                  onClick={() => handleCreateFromTemplate(template)}
                  className="w-full"
                >
                  Create Project from Template
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              No templates found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}