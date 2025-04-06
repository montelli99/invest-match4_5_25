import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import brain from "brain";
import { useEffect, useState } from "react";

interface Guide {
  id: string;
  title: string;
  content: string;
  feature: string;
  steps: string[];
  created_at: string;
}

export function HowToGuides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await brain.list_howto_guides({ token: {} });
      const data = await response.json();
      setGuides(data);
    } catch (error) {
      console.error("Error fetching guides:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const filteredGuides = guides.filter(
    (guide) =>
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.feature.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-32">
          <p>Loading how-to guides...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search how-to guides..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {filteredGuides.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            No guides found matching your search.
          </p>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {filteredGuides.map((guide) => (
            <AccordionItem key={guide.id} value={guide.id}>
              <Card className="p-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-semibold">{guide.title}</h3>
                    <Badge variant="outline">{guide.feature}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-4">
                    <div className="prose max-w-none">
                      <div
                        dangerouslySetInnerHTML={{ __html: guide.content }}
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Steps:</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        {guide.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
