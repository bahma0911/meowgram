import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@workspace/replit-auth-web";
import { doLogin } from "@/lib/auth";
import { useCreatePost } from "@/hooks/use-posts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImagePlus, Loader2, ArrowLeft } from "lucide-react";

const formSchema = z.object({
  caption: z.string().max(500, "Caption is too long").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Upload() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: createPost, isPending } = useCreatePost();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { caption: "" },
  });

  if (authLoading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-primary/10 p-6 rounded-full"><ImagePlus className="w-12 h-12 text-primary" /></div>
        <h2 className="text-2xl font-display font-bold">Log in to share</h2>
        <p className="text-muted-foreground max-w-md">You need an account to upload your cat photos and videos to Meowgram.</p>
        <Button size="lg" onClick={() => doLogin()} className="mt-4 rounded-xl">Log In</Button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const objectUrl = URL.createObjectURL(selected);
      setPreviewUrl(objectUrl);
    }
  };

  const onSubmit = (values: FormValues) => {
    if (!file) {
      form.setError("root", { message: "Please select a file to upload" });
      return;
    }

    createPost(
      { data: { caption: values.caption, file: file as Blob } },
      { onSuccess: () => setLocation("/") }
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="ghost" onClick={() => setLocation("/")} className="mb-6 hover:bg-transparent -ml-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Feed
      </Button>

      <Card className="rounded-3xl border-border/60 shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
          <CardTitle className="font-display text-2xl">Create New Post</CardTitle>
          <CardDescription>Share a photo or video of a cat with the community.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <FormLabel className="text-base font-bold">Media File</FormLabel>
                <div 
                  className={`w-full aspect-video md:aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer hover:bg-muted/50 ${previewUrl ? 'border-primary/50 bg-black/5' : 'border-border'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    file?.type.startsWith('video/') ? (
                      <video src={previewUrl} className="w-full h-full object-contain" controls />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    )
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground p-6 text-center">
                      <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <ImagePlus className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground">Click to upload image or video</p>
                      <p className="text-sm mt-1">JPEG, PNG, MP4 up to 50MB</p>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
                {form.formState.errors.root && (
                  <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.root.message}</p>
                )}
              </div>

              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Caption <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write a caption for your post..." 
                        className="resize-none rounded-xl min-h-[120px] bg-muted/20 focus-visible:bg-background transition-colors text-base"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
                <Button type="button" variant="outline" onClick={() => setLocation("/")} className="rounded-xl px-6">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !file} className="rounded-xl px-8 shadow-lg shadow-primary/20">
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                  ) : "Share Post"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
