import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/overlays";
import { Textarea } from "@/components/ui/input";
import { readingTime } from "@/lib/utils";

export function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Tabs defaultValue="write">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <span className="text-xs text-text-muted">{readingTime(value || "")} min read</span>
      </div>

      <TabsContent value="write" className="mt-3">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your post in Markdown…"
          className="min-h-[360px] font-mono text-[13px] leading-relaxed"
        />
      </TabsContent>

      <TabsContent value="preview" className="mt-3">
        <div className="prose prose-invert min-h-[360px] max-w-none rounded-lg border border-white/10 bg-white/[0.02] px-5 py-4 prose-headings:font-display prose-a:text-primary-light">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-text-muted">Nothing to preview yet.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
