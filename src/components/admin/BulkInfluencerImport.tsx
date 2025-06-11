import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, FileText, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
}

interface BulkInfluencer {
  name: string;
  weight?: string;
  height?: string;
  claimed_status?: string;
  years_training?: string;
  youtube?: string;
}

const BulkInfluencerImport = () => {
  const queryClient = useQueryClient();
  const [importData, setImportData] = useState('');
  const [parsedData, setParsedData] = useState<BulkInfluencer[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const bulkAddMutation = useMutation({
    mutationFn: async (influencers: BulkInfluencer[]) => {
      const { error } = await supabase
        .from('influencers')
        .insert(influencers.map(inf => ({
          name: inf.name,
          weight: inf.weight || null,
          height: inf.height || null,
          claimed_status: inf.claimed_status || 'unclaimed',
          years_training: inf.years_training || null,
          youtube: inf.youtube || null,
          image: '/placeholder.svg',
        })));
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-influencers'] });
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    }
  });

  const parseImportData = () => {
    try {
      const lines = importData.trim().split('\n');
      const parsed: BulkInfluencer[] = [];
      let header: string[] = [];
      for (let i = 0; i < lines.length; i++) {
        const row = lines[i];
        if (!row.trim()) continue;
        const parts = row.split(',').map(p => p.trim());
        if (i === 0) {
          header = parts;
          continue;
        }
        if (parts.length < 1 || !parts[0]) continue; // skip if no name
        let claimed_status = (header.length > 3 && parts[3]) ? parts[3].toLowerCase() : 'natty';
        if (claimed_status !== 'natty' && claimed_status !== 'juicy') claimed_status = 'natty';
        const influencer: BulkInfluencer = {
          name: parts[0],
          weight: header.length > 1 ? parts[1] || undefined : undefined,
          height: header.length > 2 ? parts[2] || undefined : undefined,
          claimed_status,
          years_training: header.length > 4 ? parts[4] || undefined : undefined,
          youtube: header.length > 5 ? parts[5] || undefined : undefined,
        };
        parsed.push(influencer);
      }
      setParsedData(parsed);
      setShowPreview(true);
      toast({
        title: "Success",
        description: `Parsed ${parsed.length} influencers. Review and import.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse import data. Check the format.",
        variant: "destructive",
      });
    }
  };

  const handleBulkImport = async () => {
    if (parsedData.length === 0) {
      toast({
        title: "Error",
        description: "No data to import.",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkAddMutation.mutateAsync(parsedData);
      
      toast({
        title: "Success",
        description: `Successfully imported ${parsedData.length} influencers!`,
      });

      // Reset form
      setImportData('');
      setParsedData([]);
      setShowPreview(false);
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: "Error",
        description: "Failed to import influencers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const template = [
      'name,weight,height,claimed_status,years_training,youtube',
      'Will Tennyson,180 lbs,5\'10\",natty,8,https://youtube.com/c/WillTennyson',
      'David Laid,185 lbs,6\'2\",juicy,7,https://youtube.com/c/DavidLaid',
      'Jane Doe,,,,,'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'influencers_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Influencers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Import multiple influencers at once using CSV format or simple text. Each line should contain: Name, Weight, Height, Claimed Status, Years Training, YouTube.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-data">Import Data</Label>
            <Textarea
              id="import-data"
              placeholder={`Paste your data here. Examples:
              
CSV Format:
Will Tennyson,180 lbs,5'10",natty,8,https://youtube.com/c/WillTennyson

Simple Format (one name per line):
Will Tennyson
Jane Smith
Mike Johnson`}
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={parseImportData}
              disabled={!importData.trim()}
              variant="outline"
            >
              Parse Data
            </Button>
            {showPreview && (
              <Button
                onClick={handleBulkImport}
                disabled={bulkAddMutation.isPending || parsedData.length === 0}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {bulkAddMutation.isPending ? 'Importing...' : `Import ${parsedData.length} Influencers`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showPreview && parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Import ({parsedData.length} influencers)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {parsedData.map((influencer, index) => (
                <div key={index} className="p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{influencer.name}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {influencer.height && <div>Height: {influencer.height}</div>}
                        {influencer.weight && <div>Weight: {influencer.weight}</div>}
                        {influencer.years_training && <div>Training: {influencer.years_training}</div>}
                        {influencer.youtube && <div>YouTube: {influencer.youtube}</div>}
                        <div>Status: {influencer.claimed_status || 'unclaimed'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkInfluencerImport; 