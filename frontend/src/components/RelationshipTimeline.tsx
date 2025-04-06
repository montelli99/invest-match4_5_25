import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  history?: Array<{
    timestamp: string;
    note?: string;
    status?: string;
  }>;
}

export function RelationshipTimeline({ history }: Props) {
  if (!history?.length) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <ScrollArea className="h-[200px] w-full pr-4">
      <div className="space-y-4">
        {history.map((event, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-24 flex-shrink-0 text-sm text-gray-500">
              {formatDate(event.timestamp)}
            </div>
            <div className="flex-grow">
              <p className="text-sm">
                {event.note || `Status changed to ${event.status}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
