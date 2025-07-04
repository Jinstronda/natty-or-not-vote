import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, FileText, Plus, AlertTriangle, CheckCircle, XCircle, Users } from "lucide-react";
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
  rowIndex?: number;
  conflicts?: InfluencerConflict[];
}

// Calculate Levenshtein distance for fuzzy string matching
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Calculate similarity percentage
const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 100;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return ((maxLength - distance) / maxLength) * 100;
};

// Types for conflict detection
interface InfluencerConflict {
  type: 'similar_influencer';
  newInfluencer: BulkInfluencer;
  existingInfluencer: {
    id: string;
    name: string;
    weight?: string;
    height?: string;
    years_training?: string;
    claimed_status?: string;
  };
  similarity: number;
}

interface ConflictResolution {
  rowIndex: number;
  resolution: 'create_new' | 'merge_data' | 'skip';
  mergeData?: Partial<BulkInfluencer>;
}

const BulkInfluencerImport = () => {
  const queryClient = useQueryClient();
  const [importData, setImportData] = useState('');
  const [parsedData, setParsedData] = useState<BulkInfluencer[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [currentConflict, setCurrentConflict] = useState<{
    row: BulkInfluencer;
    conflict: InfluencerConflict;
  } | null>(null);
  const [conflictResolutions, setConflictResolutions] = useState<ConflictResolution[]>([]);

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

  // Detect conflicts for all parsed influencers
  const detectConflicts = async (influencers: BulkInfluencer[]) => {
    setAnalyzing(true);
    const updatedInfluencers = [...influencers];
    
    // Get all existing influencers
    const { data: existingInfluencers } = await supabase
      .from("influencers")
      .select("id, name, weight, height, years_training, claimed_status");

    for (let i = 0; i < updatedInfluencers.length; i++) {
      const influencer = updatedInfluencers[i];
      const conflicts: InfluencerConflict[] = [];

      // Check for similar influencer names
      if (existingInfluencers && influencer.name) {
        for (const existing of existingInfluencers) {
          const similarity = calculateSimilarity(influencer.name, existing.name);
          if (similarity > 80 && similarity < 100) { // Very similar but not exact
            conflicts.push({
              type: 'similar_influencer',
              newInfluencer: influencer,
              existingInfluencer: existing,
              similarity
            });
          }
        }
      }

      updatedInfluencers[i].conflicts = conflicts;
      updatedInfluencers[i].rowIndex = i;
    }
    
    setAnalyzing(false);
    return updatedInfluencers;
  };

  const parseImportData = async () => {
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
          rowIndex: i - 1,
          conflicts: []
        };
        parsed.push(influencer);
      }
      
      // Detect conflicts
      const influencersWithConflicts = await detectConflicts(parsed);
      setParsedData(influencersWithConflicts);
      setShowPreview(true);
      
      const conflictCount = influencersWithConflicts.filter(inf => inf.conflicts && inf.conflicts.length > 0).length;
      toast({
        title: "Success",
        description: `Parsed ${parsed.length} influencers. ${conflictCount > 0 ? `Found ${conflictCount} potential conflicts to review.` : 'No conflicts found.'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse import data. Check the format.",
        variant: "destructive",
      });
    }
  };

  const getUnresolvedConflicts = () => {
    return parsedData.filter(inf => 
      inf.conflicts && 
      inf.conflicts.length > 0 && 
      !conflictResolutions.some(res => res.rowIndex === inf.rowIndex)
    );
  };

  const handleResolveNextConflict = () => {
    const unresolvedConflicts = getUnresolvedConflicts();
    if (unresolvedConflicts.length > 0) {
      const influencer = unresolvedConflicts[0];
      const conflict = influencer.conflicts![0];
      setCurrentConflict({ row: influencer, conflict });
      setShowConflictDialog(true);
    }
  };

  const handleConflictResolution = (resolution: 'create_new' | 'merge_data' | 'skip', mergeData?: Partial<BulkInfluencer>) => {
    if (!currentConflict) return;
    
    const newResolution: ConflictResolution = {
      rowIndex: currentConflict.row.rowIndex!,
      resolution,
      mergeData
    };
    
    setConflictResolutions(prev => [...prev, newResolution]);
    setShowConflictDialog(false);
    setCurrentConflict(null);
    
    // Auto-show next conflict
    setTimeout(handleResolveNextConflict, 100);
  };

  const getRowResolution = (rowIndex: number) => {
    return conflictResolutions.find(res => res.rowIndex === rowIndex);
  };

  const canStartImport = () => {
    const conflictRows = parsedData.filter(inf => inf.conflicts && inf.conflicts.length > 0);
    const resolvedConflicts = conflictResolutions.length;
    return conflictRows.length === resolvedConflicts;
  };

  const getRowStatusBadge = (influencer: BulkInfluencer) => {
    const resolution = getRowResolution(influencer.rowIndex!);
    const hasConflicts = influencer.conflicts && influencer.conflicts.length > 0;

    if (resolution?.resolution === 'skip') {
      return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Skipped</Badge>;
    }
    if (resolution) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
    }
    if (hasConflicts) {
      return <Badge variant="outline" className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Needs Review</Badge>;
    }
    
    return <Badge variant="outline">Ready</Badge>;
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
      // Filter out skipped rows and apply merge data
      const influencersToImport = parsedData.filter(inf => {
        const resolution = getRowResolution(inf.rowIndex!);
        return resolution?.resolution !== 'skip';
      }).map(inf => {
        const resolution = getRowResolution(inf.rowIndex!);
        if (resolution?.resolution === 'merge_data' && resolution.mergeData) {
          return { ...inf, ...resolution.mergeData };
        }
        return inf;
      });

      await bulkAddMutation.mutateAsync(influencersToImport);
      
      toast({
        title: "Success",
        description: `Successfully imported ${influencersToImport.length} influencers!`,
      });

      // Reset form
      setImportData('');
      setParsedData([]);
      setShowPreview(false);
      setConflictResolutions([]);
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: "Error",
        description: "Failed to import influencers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderConflictDialog = () => {
    if (!currentConflict) return null;
    const { row, conflict } = currentConflict;

    return (
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Similar Influencer Detected
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found an influencer with a very similar name ({conflict.similarity.toFixed(1)}% match). 
                This might be the same person or a duplicate entry.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">New Influencer (from import):</h4>
                <div className="p-4 bg-green-50 rounded border space-y-2">
                  <p className="font-medium">{conflict.newInfluencer.name}</p>
                  {conflict.newInfluencer.weight && <p><strong>Weight:</strong> {conflict.newInfluencer.weight}</p>}
                  {conflict.newInfluencer.height && <p><strong>Height:</strong> {conflict.newInfluencer.height}</p>}
                  {conflict.newInfluencer.years_training && <p><strong>Training:</strong> {conflict.newInfluencer.years_training}</p>}
                  {conflict.newInfluencer.youtube && <p><strong>YouTube:</strong> {conflict.newInfluencer.youtube}</p>}
                  <p><strong>Status:</strong> {conflict.newInfluencer.claimed_status || 'unclaimed'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">Existing Influencer:</h4>
                <div className="p-4 bg-blue-50 rounded border space-y-2">
                  <p className="font-medium">{conflict.existingInfluencer.name}</p>
                  {conflict.existingInfluencer.weight && <p><strong>Weight:</strong> {conflict.existingInfluencer.weight}</p>}
                  {conflict.existingInfluencer.height && <p><strong>Height:</strong> {conflict.existingInfluencer.height}</p>}
                  {conflict.existingInfluencer.years_training && <p><strong>Training:</strong> {conflict.existingInfluencer.years_training}</p>}
                  <p><strong>Status:</strong> {conflict.existingInfluencer.claimed_status || 'unclaimed'}</p>
                  <p className="text-sm text-muted-foreground">Already in database</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => handleConflictResolution('create_new')}>
              Create New Influencer
            </Button>
            <Button 
              variant="default" 
              onClick={() => {
                // Merge the data - take new data where available, keep existing otherwise
                const mergedData = {
                  name: conflict.newInfluencer.name, // Use new name
                  weight: conflict.newInfluencer.weight || conflict.existingInfluencer.weight,
                  height: conflict.newInfluencer.height || conflict.existingInfluencer.height,
                  years_training: conflict.newInfluencer.years_training || conflict.existingInfluencer.years_training,
                  claimed_status: conflict.newInfluencer.claimed_status || conflict.existingInfluencer.claimed_status,
                  youtube: conflict.newInfluencer.youtube
                };
                handleConflictResolution('merge_data', mergedData);
              }}
            >
              Merge Data (Update Existing)
            </Button>
            <Button variant="destructive" onClick={() => handleConflictResolution('skip')}>
              Skip This Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
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
              disabled={!importData.trim() || analyzing}
              variant="outline"
            >
              {analyzing ? 'Analyzing...' : 'Parse & Check Conflicts'}
            </Button>
            {showPreview && (
              <>
                {getUnresolvedConflicts().length > 0 && (
                  <Button variant="secondary" onClick={handleResolveNextConflict}>
                    Resolve Conflicts ({getUnresolvedConflicts().length} remaining)
                  </Button>
                )}
                <Button
                  onClick={handleBulkImport}
                  disabled={bulkAddMutation.isPending || parsedData.length === 0 || !canStartImport()}
                  className={`flex items-center gap-2 ${canStartImport() ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  <Plus className="h-4 w-4" />
                  {bulkAddMutation.isPending ? 'Importing...' : `Import ${parsedData.filter(inf => getRowResolution(inf.rowIndex!)?.resolution !== 'skip').length} Influencers`}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {showPreview && parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Import ({parsedData.length} influencers)</CardTitle>
            {getUnresolvedConflicts().length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {getUnresolvedConflicts().length} influencers have potential conflicts that need your review before import.
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {parsedData.map((influencer, index) => (
                <div 
                  key={index} 
                  className={`p-3 border rounded-lg ${
                    influencer.conflicts && influencer.conflicts.length > 0 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{influencer.name}</h4>
                        {getRowStatusBadge(influencer)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {influencer.height && <div>Height: {influencer.height}</div>}
                        {influencer.weight && <div>Weight: {influencer.weight}</div>}
                        {influencer.years_training && <div>Training: {influencer.years_training}</div>}
                        {influencer.youtube && <div>YouTube: {influencer.youtube}</div>}
                        <div>Status: {influencer.claimed_status || 'unclaimed'}</div>
                      </div>
                      {influencer.conflicts && influencer.conflicts.length > 0 && (
                        <div className="mt-2">
                          {influencer.conflicts.map((conflict, ci) => (
                            <div key={ci} className="text-xs text-orange-600">
                              Similar to: {conflict.existingInfluencer.name} ({conflict.similarity.toFixed(1)}% match)
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {renderConflictDialog()}
    </div>
  );
};

export default BulkInfluencerImport; 