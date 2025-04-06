import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import brain from "brain";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { ListHowtoGuidesData } from "types";

interface Guide {
  id: string;
  title: string;
  content: string;
  type: string;
  updated_at: string;
}



export default function HowToGuides() {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch guides
  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await brain.list_howto_guides({});
      const data = await response.json();
      // Convert API response to our Guide type
setGuides(data.map((item: any) => ({
  id: item.id,
  title: item.title,
  content: item.content,
  type: item.type || 'General',
  updated_at: item.updated_at
})));
      setError(null);
    } catch (err) {
      console.error("Error fetching guides:", err);
      setError("Failed to load how-to guides. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  // Filter guides based on search query
  const filteredGuides = guides.filter(
    (guide) =>
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group guides by first tag (using as category)
  const groupedGuides = filteredGuides.reduce(
    (acc, guide) => {
      const category = guide.type;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(guide);
      return acc;
    },
    {} as Record<string, Guide[]>,
  );

  const handleViewGuide = (guideId: string) => {
    navigate(`/ViewGuide?id=${guideId}`);
  };

  if (error) {
    return (
      <div className="p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">How-To Guides</h1>
        <div className="w-1/3">
          <Input
            type="search"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredGuides.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "No guides found matching your search."
                : "No guides available."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">
            {Object.entries(groupedGuides).map(([category, guides]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guides.map((guide) => (
                      <Card
                        key={guide.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleViewGuide(guide.id)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {guide.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {guide.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Last updated:{" "}
                            {new Date(guide.updated_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
