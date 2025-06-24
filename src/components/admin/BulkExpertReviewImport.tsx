import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, XCircle, Users, FileText } from "lucide-react";

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
interface ExpertConflict {
  type: 'similar_expert';
  newName: string;
  existingExpert: { id: string; name: string };
  similarity: number;
}

interface ReviewConflict {
  type: 'existing_review';
  expertId: string;
  influencerId: string;
  existingReview: {
    id: string;
    content: string;
    rating: number;
    author: string;
    expert_id: string | null;
  };
}

interface ParsedRow {
  expert: string;
  influencer: string;
  natty: string;
  comment: string;
  url: string;
  rowIndex: number;
  conflicts?: (ExpertConflict | ReviewConflict)[];
  resolution?: 'create_new' | 'use_existing' | 'replace_existing' | 'skip';
}

interface ConflictResolution {
  rowIndex: number;
  conflictIndex: number;
  resolution: 'create_new' | 'use_existing' | 'replace_existing' | 'skip';
}

// Format: expert_name,influencer_name,natty_or_not,comment,url
const parseCSV = (input: string): ParsedRow[] => {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [expert, influencer, natty, comment, url] = line.split(",");
      return { 
        expert: expert?.trim(), 
        influencer: influencer?.trim(), 
        natty: natty?.trim(), 
        comment: comment?.trim(), 
        url: url?.trim(),
        rowIndex: index,
        conflicts: []
      };
    });
};

const BulkExpertReviewImport: React.FC = () => {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [currentConflict, setCurrentConflict] = useState<{
    row: ParsedRow;
    conflict: ExpertConflict | ReviewConflict;
    conflictIndex: number;
  } | null>(null);
  const [conflictResolutions, setConflictResolutions] = useState<ConflictResolution[]>([]);
  const { toast } = useToast();

  // Detect conflicts for all parsed rows
  const detectConflicts = async (rows: ParsedRow[]) => {
    setAnalyzing(true);
    const updatedRows = [...rows];
    
    // Get all existing experts and their reviews
    const { data: existingExperts } = await supabase
      .from("experts")
      .select("id, name");
    
    const { data: existingInfluencers } = await supabase
      .from("influencers")
      .select("id, name");
    
    const { data: existingReviews } = await supabase
      .from("expert_reviews")
      .select(`
        id, content, rating, author, expert_id,
        experts!inner(name),
        influencers!inner(name)
      `);

    for (let i = 0; i < updatedRows.length; i++) {
      const row = updatedRows[i];
      const conflicts: (ExpertConflict | ReviewConflict)[] = [];

      // Check for similar expert names
      if (existingExperts && row.expert) {
        for (const expert of existingExperts) {
          const similarity = calculateSimilarity(row.expert, expert.name);
          if (similarity > 80 && similarity < 100) { // Very similar but not exact
            conflicts.push({
              type: 'similar_expert',
              newName: row.expert,
              existingExpert: expert,
              similarity
            });
          }
        }
      }

      // Check for existing reviews by the same expert for the same influencer
      if (existingReviews && row.expert && row.influencer) {
        for (const review of existingReviews) {
          const expertNameMatch = review.experts?.name === row.expert || review.author === row.expert;
          const influencerNameMatch = review.influencers?.name === row.influencer;
          
          if (expertNameMatch && influencerNameMatch) {
            conflicts.push({
              type: 'existing_review',
              expertId: review.expert_id || '',
              influencerId: '', // We'll resolve this during import
              existingReview: {
                id: review.id,
                content: review.content,
                rating: review.rating,
                author: review.author || review.experts?.name || '',
                expert_id: review.expert_id
              }
            });
          }
        }
      }

      updatedRows[i].conflicts = conflicts;
    }
    
    setAnalyzing(false);
    return updatedRows;
  };

  const handlePreview = async () => {
    const parsedRows = parseCSV(input);
    const rowsWithConflicts = await detectConflicts(parsedRows);
    setParsed(rowsWithConflicts);
    setResults([]);
  };

  const getUnresolvedConflicts = () => {
    return parsed.filter(row => 
      row.conflicts && 
      row.conflicts.length > 0 && 
      !conflictResolutions.some(res => res.rowIndex === row.rowIndex)
    );
  };

  const handleResolveNextConflict = () => {
    const unresolvedConflicts = getUnresolvedConflicts();
    if (unresolvedConflicts.length > 0) {
      const row = unresolvedConflicts[0];
      const conflict = row.conflicts![0];
      setCurrentConflict({ row, conflict, conflictIndex: 0 });
      setShowConflictDialog(true);
    }
  };

  const handleConflictResolution = (resolution: 'create_new' | 'use_existing' | 'replace_existing' | 'skip') => {
    if (!currentConflict) return;
    
    const newResolution: ConflictResolution = {
      rowIndex: currentConflict.row.rowIndex,
      conflictIndex: currentConflict.conflictIndex,
      resolution
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
    const conflictRows = parsed.filter(row => row.conflicts && row.conflicts.length > 0);
    const resolvedConflicts = conflictResolutions.length;
    return conflictRows.length === resolvedConflicts;
  };

  const handleImport = async () => {
    setImporting(true);
    setResults([]);
    const newResults: any[] = [];
    
    for (const row of parsed) {
      if (!row.expert || !row.influencer || !row.natty) {
        newResults.push({ ...row, status: "error", message: "Missing required fields" });
        continue;
      }

      // Check if this row should be skipped due to conflict resolution
      const resolution = getRowResolution(row.rowIndex);
      if (resolution?.resolution === 'skip') {
        newResults.push({ ...row, status: "skipped", message: "Skipped due to conflict resolution" });
        continue;
      }

      // Handle the import based on resolution
      try {
        // 1. Find or create influencer
        let influencerId: string | null = null;
        const { data: infs, error: infErr } = await supabase
          .from("influencers")
          .select("id")
          .eq("name", row.influencer)
          .maybeSingle();
        
        if (infErr) {
          newResults.push({ ...row, status: "error", message: infErr.message });
          continue;
        }
        
        if (infs?.id) {
          influencerId = infs.id;
        } else {
          // Create influencer
          const { data: newInf, error: newInfErr } = await supabase
            .from("influencers")
            .insert({ name: row.influencer })
            .select()
            .maybeSingle();
          if (newInfErr || !newInf?.id) {
            newResults.push({ ...row, status: "error", message: newInfErr?.message || "Failed to create influencer" });
            continue;
          }
          influencerId = newInf.id;
        }

        // 2. Handle expert based on conflict resolution
        let expertId: string | null = null;
        
        if (resolution?.resolution === 'use_existing' && row.conflicts) {
          const expertConflict = row.conflicts.find(c => c.type === 'similar_expert') as ExpertConflict;
          if (expertConflict) {
            expertId = expertConflict.existingExpert.id;
          }
        } else {
          // Find or create expert (original logic)
          const { data: expert, error: expertErr } = await supabase
            .from("experts")
            .select("id")
            .eq("name", row.expert)
            .maybeSingle();
          
          if (expertErr) {
            newResults.push({ ...row, status: "error", message: expertErr.message });
            continue;
          }
          
          if (expert?.id) {
            expertId = expert.id;
          } else {
            // Create expert
            const { data: newExpert, error: newExpertErr } = await supabase
              .from("experts")
              .insert({ name: row.expert })
              .select()
              .maybeSingle();
            if (newExpertErr || !newExpert?.id) {
              newResults.push({ ...row, status: "error", message: newExpertErr?.message || "Failed to create expert" });
              continue;
            }
            expertId = newExpert.id;
          }
        }

        // 3. Handle existing review conflicts
        if (resolution?.resolution === 'replace_existing' && row.conflicts) {
          const reviewConflict = row.conflicts.find(c => c.type === 'existing_review') as ReviewConflict;
          if (reviewConflict) {
            // Delete existing review
            await supabase
              .from("expert_reviews")
              .delete()
              .eq("id", reviewConflict.existingReview.id);
          }
        }

        // 4. Insert new review
        const nattyValue = row.natty.toLowerCase() === "natty" ? 5 : 1;
        let reviewInsert;
        
        if (expertId) {
          reviewInsert = {
            influencer_id: influencerId,
            expert_id: expertId,
            content: row.comment || "",
            rating: nattyValue,
            link_url: row.url || null,
          };
        } else {
          reviewInsert = {
            influencer_id: influencerId,
            author: row.expert,
            content: row.comment || "",
            rating: nattyValue,
            link_url: row.url || null,
          };
        }
        
        const { error: reviewErr } = await supabase.from("expert_reviews").insert(reviewInsert);
        if (reviewErr) {
          newResults.push({ ...row, status: "error", message: reviewErr.message });
        } else {
          newResults.push({ ...row, status: "success", message: "Imported" });
        }
      } catch (error) {
        newResults.push({ ...row, status: "error", message: error instanceof Error ? error.message : "Unknown error" });
      }
    }
    
    setResults(newResults);
    setImporting(false);
    toast({ 
      title: "Bulk import complete", 
      description: `${newResults.filter(r => r.status === 'success').length} succeeded, ${newResults.filter(r => r.status === 'error').length} failed, ${newResults.filter(r => r.status === 'skipped').length} skipped.` 
    });
  };

  const renderConflictDialog = () => {
    if (!currentConflict) return null;
    const { row, conflict } = currentConflict;

    if (conflict.type === 'similar_expert') {
      return (
        <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                Similar Expert Name Detected
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Found an expert with a very similar name ({conflict.similarity.toFixed(1)}% match). 
                  This might be the same person with a slightly different spelling.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700">New Expert (from import):</h4>
                  <div className="p-3 bg-green-50 rounded border">
                    <p className="font-medium">{conflict.newName}</p>
                    <p className="text-sm text-muted-foreground">
                      Review: {row.comment || 'No comment'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-700">Existing Expert:</h4>
                  <div className="p-3 bg-blue-50 rounded border">
                    <p className="font-medium">{conflict.existingExpert.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Already in database
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => handleConflictResolution('create_new')}>
                Create New Expert
              </Button>
              <Button variant="default" onClick={() => handleConflictResolution('use_existing')}>
                Use Existing Expert
              </Button>
              <Button variant="destructive" onClick={() => handleConflictResolution('skip')}>
                Skip This Row
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    } else if (conflict.type === 'existing_review') {
      return (
        <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-500" />
                Existing Review Found
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This expert has already reviewed this influencer. Do you want to replace the existing review?
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700">New Review (from import):</h4>
                  <div className="p-3 bg-green-50 rounded border space-y-2">
                    <p><strong>Expert:</strong> {row.expert}</p>
                    <p><strong>Influencer:</strong> {row.influencer}</p>
                    <p><strong>Verdict:</strong> {row.natty}</p>
                    <p><strong>Comment:</strong> {row.comment || 'No comment'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700">Existing Review:</h4>
                  <div className="p-3 bg-red-50 rounded border space-y-2">
                    <p><strong>Expert:</strong> {conflict.existingReview.author}</p>
                    <p><strong>Verdict:</strong> {conflict.existingReview.rating === 5 ? 'Natty' : 'Juicy'}</p>
                    <p><strong>Comment:</strong> {conflict.existingReview.content || 'No comment'}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => handleConflictResolution('skip')}>
                Skip This Row
              </Button>
              <Button variant="destructive" onClick={() => handleConflictResolution('replace_existing')}>
                Replace Existing Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return null;
  };

  const getRowStatusBadge = (row: ParsedRow) => {
    const resolution = getRowResolution(row.rowIndex);
    const hasConflicts = row.conflicts && row.conflicts.length > 0;
    const resultStatus = results[row.rowIndex]?.status;

    if (resultStatus === 'success') {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
    }
    if (resultStatus === 'error') {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
    }
    if (resultStatus === 'skipped') {
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

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardContent className="space-y-6 py-8">
        <h2 className="text-xl font-bold mb-2">Bulk Import Expert Reviews</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            CSV Format Instructions
          </h3>
          
          <div className="text-sm space-y-2">
            <p className="text-blue-800">
              <strong>Format:</strong> <code className="bg-white px-2 py-1 rounded">expert_name,influencer_name,verdict,comment,url</code>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
              <div>
                <p><strong>Verdict Field:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• <code className="bg-green-100 text-green-800 px-1 rounded">natty</code> - Natural physique</li>
                  <li>• <code className="bg-pink-100 text-pink-800 px-1 rounded">juicy</code> - Enhanced physique</li>
                </ul>
              </div>
              
              <div>
                <p><strong>Example Lines:</strong></p>
                <div className="bg-white p-2 rounded border text-xs font-mono">
                  Dr. Smith,John Doe,<span className="text-green-600">natty</span>,Looks natural,<br/>
                  Prof. Jones,Jane Fit,<span className="text-pink-600">juicy</span>,Clear signs of enhancement,https://example.com
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={8}
          placeholder="Dr. Smith,John Doe,natty,Looks natural,https://example.com/review1&#10;Prof. Jones,Jane Fit,juicy,Clear signs of enhancement,https://example.com/review2&#10;Dr. Garcia,Mike Bulk,natty,Achievable naturally,"
        />
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview} disabled={!input || analyzing}>
            {analyzing ? 'Analyzing...' : 'Preview & Check Conflicts'}
          </Button>
          
          {parsed.length > 0 && (
            <>
              {getUnresolvedConflicts().length > 0 && (
                <Button variant="secondary" onClick={handleResolveNextConflict}>
                  Resolve Conflicts ({getUnresolvedConflicts().length} remaining)
                </Button>
              )}
              
              <Button 
                onClick={handleImport} 
                disabled={!canStartImport() || importing}
                className={canStartImport() ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {importing ? 'Importing...' : 'Import'}
              </Button>
            </>
          )}
        </div>

        {parsed.length > 0 && (
          <>
            {getUnresolvedConflicts().length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {getUnresolvedConflicts().length} rows have potential conflicts that need your review before import.
                </AlertDescription>
              </Alert>
            )}

            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Expert</TableHead>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Verdict</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.map((row, i) => (
                  <TableRow key={i} className={row.conflicts && row.conflicts.length > 0 ? 'bg-orange-50' : ''}>
                    <TableCell>{row.expert}</TableCell>
                    <TableCell>{row.influencer}</TableCell>
                    <TableCell>{row.natty}</TableCell>
                    <TableCell className="max-w-48 truncate">{row.comment}</TableCell>
                    <TableCell>
                      {row.url ? <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : ''}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getRowStatusBadge(row)}
                        {results[i]?.status === 'error' && (
                          <p className="text-xs text-red-600">{results[i]?.message}</p>
                        )}
                        {row.conflicts && row.conflicts.length > 0 && (
                          <div className="text-xs text-orange-600">
                            {row.conflicts.map((conflict, ci) => (
                              <div key={ci}>
                                {conflict.type === 'similar_expert' ? 
                                  `Similar to: ${conflict.existingExpert.name}` :
                                  'Review already exists'
                                }
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {renderConflictDialog()}
      </CardContent>
    </Card>
  );
};

export default BulkExpertReviewImport; 