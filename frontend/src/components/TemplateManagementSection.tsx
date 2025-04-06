import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  Badge,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ActionTemplate } from "types";

/**
 * Interface for template effectiveness data
 */
export interface TemplateEffectivenessData {
  name: string;
  successRate: number;
  usageCount: number;
  responseTime: number;
}

/**
 * Interface for action template data
 */
export interface ActionTemplateData {
  id: ActionTemplate;
  name: string;
  description: string;
  category: string;
}

interface TemplateManagementSectionProps {
  actionTemplates: ActionTemplateData[];
  selectedTemplate: ActionTemplate | null;
  setSelectedTemplate: (template: ActionTemplate | null) => void;
}

/**
 * Template Management Section Component - Displays template effectiveness metrics and management UI
 * 
 * This component encapsulates all the charts and visualizations related to action templates,
 * helping to keep the main dashboard component more manageable.
 */
export function TemplateManagementSection({ 
  actionTemplates, 
  selectedTemplate, 
  setSelectedTemplate 
}: TemplateManagementSectionProps) {
  // Generate template effectiveness data
  const templateEffectivenessData = useMemo(() => {
    return actionTemplates.map(template => ({
      name: template.name,
      successRate: Math.round(65 + Math.random() * 30),
      usageCount: Math.round(20 + Math.random() * 80),
      responseTime: Math.round(30 + Math.random() * 60)
    }));
  }, [actionTemplates]);

  // Template type distribution
  const templateTypeData = useMemo(() => {
    const categories = actionTemplates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [actionTemplates]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Template Effectiveness</CardTitle>
            <CardDescription>Performance metrics for action templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={templateEffectivenessData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="successRate" name="Success Rate (%)" fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Template Usage</CardTitle>
            <CardDescription>Distribution of template categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={templateTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {templateTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {templateTypeData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Action Templates</CardTitle>
          <CardDescription>Pre-defined moderation actions and responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {actionTemplates.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all ${selectedTemplate === template.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="secondary">{template.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="w-full">
                    <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
                    <div className="flex items-center gap-2">
                      <Progress value={65 + Math.random() * 30} className="h-1" />
                      <span className="text-xs">{Math.round(65 + Math.random() * 30)}%</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}