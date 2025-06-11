import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Format: expert_name,influencer_name,natty_or_not,comment
const parseCSV = (input: string) => {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [expert, influencer, natty, comment] = line.split(",");
      return { expert: expert?.trim(), influencer: influencer?.trim(), natty: natty?.trim(), comment: comment?.trim() };
    });
};

const BulkExpertReviewImport: React.FC = () => {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handlePreview = () => {
    setParsed(parseCSV(input));
    setResults([]);
  };

  const handleImport = async () => {
    setImporting(true);
    setResults([]);
    const rows = parseCSV(input);
    const newResults: any[] = [];
    for (const row of rows) {
      if (!row.expert || !row.influencer || !row.natty) {
        newResults.push({ ...row, status: "error", message: "Missing required fields" });
        continue;
      }
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
      // 2. Find or create expert
      let expertId: string | null = null;
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
      // 3. Insert expert review (use expert_id foreign key, fallback to author if needed)
      const nattyValue = row.natty.toLowerCase() === "natty" ? 5 : 1;
      let reviewInsert;
      if (expertId) {
        reviewInsert = {
          influencer_id: influencerId,
          expert_id: expertId,
          content: row.comment || "",
          rating: nattyValue,
        };
      } else {
        reviewInsert = {
          influencer_id: influencerId,
          author: row.expert,
          content: row.comment || "",
          rating: nattyValue,
        };
      }
      const { error: reviewErr } = await supabase.from("expert_reviews").insert(reviewInsert);
      if (reviewErr) {
        newResults.push({ ...row, status: "error", message: reviewErr.message });
      } else {
        newResults.push({ ...row, status: "success", message: "Imported" });
      }
    }
    setResults(newResults);
    setImporting(false);
    toast({ title: "Bulk import complete", description: `${newResults.filter(r => r.status === 'success').length} succeeded, ${newResults.filter(r => r.status === 'error').length} failed.` });
  };

  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <CardContent className="space-y-6 py-8">
        <h2 className="text-xl font-bold mb-2">Bulk Import Expert Reviews</h2>
        <p className="text-muted-foreground text-sm mb-2">Paste CSV: <code>expert_name,influencer_name,natty_or_not,comment</code></p>
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={8}
          placeholder="Dr. Smith,John Doe,natty,Looks natural\nDr. Smith,Jane Fit,juicy,Obvious signs of enhancement."
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview} disabled={!input}>Preview</Button>
          <Button onClick={handleImport} disabled={!parsed.length || importing}>
            {importing ? 'Importing...' : 'Import'}
          </Button>
        </div>
        {parsed.length > 0 && (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Expert</TableHead>
                <TableHead>Influencer</TableHead>
                <TableHead>Natty/Not</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsed.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.expert}</TableCell>
                  <TableCell>{row.influencer}</TableCell>
                  <TableCell>{row.natty}</TableCell>
                  <TableCell>{row.comment}</TableCell>
                  <TableCell>{results[i]?.status === 'success' ? '✅' : results[i]?.status === 'error' ? `❌ ${results[i]?.message}` : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkExpertReviewImport; 