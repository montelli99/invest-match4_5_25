import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import brain from "brain";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { GetHowtoGuideData } from "types";

interface Guide {
  id: string;
  title: string;
  content: string;
  type: string;
  updated_at: string;
}



export default function ViewGuide() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const guideId = searchParams.get("id");

  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuide = async () => {
      if (!guideId) {
        setError("No guide ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await brain.get_howto_guide({ guideId }, {});
        const data: GetHowtoGuideData = await response.json();
        // Convert API response to our Guide type
setGuide({
  id: data.id,
  title: data.title,
  content: data.content,
  type: data.type || 'General',
  updated_at: data.updated_at
});
        setError(null);
      } catch (err) {
        console.error("Error fetching guide:", err);
        setError("Failed to load guide. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [guideId]);

  const handleBack = () => {
    navigate("/HowToGuides");
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
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={handleBack} className="mr-4">
          ← Back to Guides
        </Button>
        {guide && (
          <div>
            <h1 className="text-3xl font-bold">{guide.title}</h1>
            <p className="text-sm text-gray-500">
              Type: {guide.type} | Last updated:{" "}
              {new Date(guide.updated_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : guide ? (
        <Card>
          <CardContent className="p-6">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: guide.content }}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
