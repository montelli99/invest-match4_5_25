import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import brain from "brain";
import { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  content: string;
  category_id: string;
  tags: string[];
  created_at: string;
}

export function KnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await brain.list_kb_articles({ token: {} });
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-32">
          <p>Loading knowledge base...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search knowledge base..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {filteredArticles.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            No articles found matching your search.
          </p>
        </Card>
      ) : (
        filteredArticles.map((article) => (
          <Card key={article.id} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
            <div className="flex gap-2 mt-4">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
