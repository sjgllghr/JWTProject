import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TextSubmissionForm from "@/components/TextSubmissionForm";
import SubmissionsTable from "@/components/SubmissionsTable";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const { toast } = useToast();

  // Fetch posts
  const { data: submissions = [], refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error fetching posts",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data.map((post) => ({
        id: post.id,
        text: post.content || "",
        timestamp: new Date(post.created_at).toLocaleString(),
      }));
    },
  });

  const handleSubmit = async (text: string) => {
    const { error } = await supabase.from("Posts").insert([{ content: text }]);

    if (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Your post has been created",
    });
    refetch();
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Text Submission System
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
        <TextSubmissionForm onSubmit={handleSubmit} />
        <SubmissionsTable submissions={submissions} />
      </div>
    </div>
  );
};

export default Index;