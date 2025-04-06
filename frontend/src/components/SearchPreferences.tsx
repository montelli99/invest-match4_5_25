import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import brain from "brain";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchHistoryEntry, SearchPreset } from "types";

interface Props {
  userId: string;
  currentFilters?: any;
  onPresetSelect: (preset: SearchPreset) => void;
}

export function SearchPreferences({
  userId,
  currentFilters,
  onPresetSelect,
}: Props) {
  const [presets, setPresets] = useState<SearchPreset[]>([]);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [isCreatePresetOpen, setIsCreatePresetOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch presets and history
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [presetsResponse, historyResponse] = await Promise.all([
          brain.get_user_presets(userId),
          brain.get_search_history(userId),
        ]);

        const presetsData = await presetsResponse.json();
        const historyData = await historyResponse.json();

        setPresets(presetsData);
        setHistory(historyData);
      } catch (error) {
        console.error("Error fetching search preferences:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load search preferences",
        });
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, toast]);

  const handleCreatePreset = async () => {
    if (!newPresetName.trim() || !currentFilters) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a name for the preset",
      });
      return;
    }

    try {
      const preset: SearchPreset = {
        id: Date.now().toString(),
        user_id: userId,
        name: newPresetName.trim(),
        filters: currentFilters,
        created_at: new Date().toISOString(),
      };

      const response = await brain.create_search_preset(preset);
      const newPreset = await response.json();

      setPresets([newPreset, ...presets]);
      setNewPresetName("");
      setIsCreatePresetOpen(false);

      toast({
        title: "Success",
        description: "Search preset created successfully",
      });
    } catch (error) {
      console.error("Error creating preset:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create search preset",
      });
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      await brain.delete_search_preset(presetId);
      setPresets(presets.filter((p) => p.id !== presetId));

      toast({
        title: "Success",
        description: "Search preset deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting preset:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete search preset",
      });
    }
  };

  const handlePresetSelect = async (preset: SearchPreset) => {
    try {
      await brain.update_preset_last_used(preset.id);
      onPresetSelect(preset);

      // Update the last_used timestamp locally
      const updatedPresets = presets.map((p) => {
        if (p.id === preset.id) {
          return { ...p, last_used: new Date().toISOString() };
        }
        return p;
      });
      setPresets(updatedPresets);
    } catch (error) {
      console.error("Error updating preset last used:", error);
    }
  };

  const handleHistoryItemClick = (entry: SearchHistoryEntry) => {
    onPresetSelect({
      id: entry.id,
      user_id: entry.user_id,
      name: `Search from ${new Date(entry.timestamp).toLocaleDateString()}`,
      filters: entry.filters,
      created_at: entry.timestamp,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Search Preferences</h2>
        <Dialog open={isCreatePresetOpen} onOpenChange={setIsCreatePresetOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={!currentFilters}>
              Save Current Search
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Search Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Enter preset name"
                />
              </div>
              <Button onClick={handleCreatePreset} className="w-full">
                Save Preset
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Saved Presets */}
        <Card className="p-4">
          <h3 className="font-medium mb-2">Saved Presets</h3>
          <ScrollArea className="h-[200px]">
            {presets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved presets</p>
            ) : (
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                  >
                    <button
                      onClick={() => handlePresetSelect(preset)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {preset.last_used
                          ? `Last used ${new Date(preset.last_used).toLocaleDateString()}`
                          : `Created ${new Date(preset.created_at).toLocaleDateString()}`}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePreset(preset.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Search History */}
        <Card className="p-4">
          <h3 className="font-medium mb-2">Recent Searches</h3>
          <ScrollArea className="h-[200px]">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No search history</p>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2 hover:bg-accent rounded-md"
                  >
                    <button
                      onClick={() => handleHistoryItemClick(entry)}
                      className="w-full text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.results_count} results
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {Object.entries(entry.filters)
                          .filter(
                            ([_, value]) =>
                              value !== null && value !== undefined,
                          )
                          .map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key.replace(/_/g, " ")}:{" "}
                              {Array.isArray(value) ? value.join(", ") : value}
                            </span>
                          ))}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
