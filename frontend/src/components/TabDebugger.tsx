import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TabDebuggerProps {
  activeTab: string;
  activeSubTab?: string;
  allTabs: string[];
  allSubTabs?: Record<string, string[]>;
  className?: string;
}

/**
 * Component for debugging tab rendering issues
 * Shows the current active tab state and all available tabs
 */
export function TabDebugger({
  activeTab,
  activeSubTab,
  allTabs,
  allSubTabs,
  className = ''
}: TabDebuggerProps) {
  console.log('TabDebugger rendering:', {
    activeTab,
    activeSubTab,
    allTabs,
    allSubTabs
  });

  return (
    <Card className={`border-2 border-red-500 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-red-500 flex items-center gap-2">
          <span>🐞 Tab Debugger</span>
          <span className="text-xs bg-red-100 text-red-800 rounded-md px-2 py-1">
            Debug Only - Remove in Production
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold">Active Tab State:</h3>
            <ul className="list-disc list-inside ml-4">
              <li>Main Tab: <span className="font-mono bg-gray-100 p-1 rounded">{activeTab}</span></li>
              {activeSubTab && (
                <li>Sub Tab: <span className="font-mono bg-gray-100 p-1 rounded">{activeSubTab}</span></li>
              )}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold">All Main Tabs:</h3>
              <ul className="list-disc list-inside ml-4">
                {allTabs.map(tab => (
                  <li key={tab} className={activeTab === tab ? 'text-green-600 font-bold' : ''}>
                    {tab}
                  </li>
                ))}
              </ul>
            </div>

            {allSubTabs && (
              <div>
                <h3 className="font-bold">Sub Tabs for "{activeTab}":</h3>
                {allSubTabs[activeTab] ? (
                  <ul className="list-disc list-inside ml-4">
                    {allSubTabs[activeTab].map(subTab => (
                      <li key={subTab} className={activeSubTab === subTab ? 'text-green-600 font-bold' : ''}>
                        {subTab}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No sub-tabs defined for this tab</p>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold">DOM Structure Check:</h3>
            <p className="text-sm">Tab element count: <span id="tab-count-debug">Calculating...</span></p>
            <p className="text-sm">Tab visibility issues: <span id="tab-visibility-debug">Checking...</span></p>
            <button
              onClick={() => {
                // Count all tab elements
                const tabElements = document.querySelectorAll('[role="tab"]');
                document.getElementById('tab-count-debug')!.textContent = `${tabElements.length}`;
                
                // Check visibility of tabs
                let hiddenTabs = 0;
                tabElements.forEach(el => {
                  const style = window.getComputedStyle(el);
                  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                    hiddenTabs++;
                  }
                });
                
                document.getElementById('tab-visibility-debug')!.textContent = 
                  hiddenTabs > 0 ? `${hiddenTabs} tabs might be hidden by CSS` : 'All tabs appear visible';
              }}
              className="mt-2 bg-red-100 text-red-800 px-3 py-1 rounded text-sm"
            >
              Check DOM Now
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
