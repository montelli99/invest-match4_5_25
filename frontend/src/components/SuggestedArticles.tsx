import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import brain from "brain";
import { useEffect, useState } from "react";

interface Article {
  id: string;
  title: string;
  content: string;
  type: string;
  relevance?: number;
}

interface Props {
  searchText: string;
  onArticleClick: (article: Article) => void;
}

export function SuggestedArticles({ searchText, onArticleClick }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchArticles = async () => {
      if (!searchText || searchText.length < 3) {
        setArticles([]);
        return;
      }

      try {
        setLoading(true);
        // Search both how-to guides and KB articles
        const [guidesResponse, kbResponse] = await Promise.all([
          brain.list_howto_guides({}),
          brain.list_kb_articles({}),
        ]);

        const [guidesData, kbData] = await Promise.all([
          guidesResponse.json(),
          kbResponse.json(),
        ]);

        // Combine and filter articles based on search text
        const allArticles = [
          ...guidesData.map((guide: any) => ({
            id: guide.id,
            title: guide.title,
            content: guide.content,
            type: "guide",
          })),
          ...kbData.map((article: any) => ({
            id: article.id,
            title: article.title,
            content: article.content,
            type: "kb",
          })),
        ];

        // Simple relevance scoring
        const searchTerms = searchText.toLowerCase().split(" ");
        const relevantArticles = allArticles
          .map((article) => {
            const titleMatches = searchTerms.filter((term) =>
              article.title.toLowerCase().includes(term),
            ).length;
            const contentMatches = searchTerms.filter((term) =>
              article.content.toLowerCase().includes(term),
            ).length;

            const relevance = titleMatches * 2 + contentMatches;
            return { ...article, relevance };
          })
          .filter((article) => article.relevance > 0)
          .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
          .slice(0, 3); // Show top 3 most relevant articles

        setArticles(relevantArticles);
        setError(null);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Failed to load suggested articles");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchArticles, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchText]);

  if (!searchText || searchText.length < 3) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Suggested Articles</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-gray-500">No relevant articles found.</p>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  onClick={() => onArticleClick(article)}
                >
                  <h3 className="font-medium mb-1">{article.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {article.content}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 capitalize">
                      {article.type === "kb"
                        ? "Knowledge Base"
                        : "How-To Guide"}
                    </span>
                    <Button variant="ghost" size="sm">
                      Read More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
