import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TextSubmissionForm from "@/components/TextSubmissionForm";
import SubmissionsTable from "@/components/SubmissionsTable";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const Index = () => {
  const { toast } = useToast();

  // Fetch posts
  const { data: submissions = [], refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      // const { data, error } = await supabase
      //   .from("Posts")
      //   .select("*")
      //   .order("created_at", { ascending: false });
      try {
        //const response = await axios.get("http://localhost:8080/posts");
        const response = await axios.get(import.meta.env.VITE_API_HOST + '/posts');
        console.log(import.meta.env.VITE_API_HOST);

        return response.data.map((post) => ({
          id: post._id,
          text: post.content || "",
          timestamp: new Date(post.created_at).toLocaleString(),
          matchingJWT: post.matchingJWT
        }));
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error fetching posts",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const handleSubmit = async (text: string) => {
    //const { error } = await supabase.from("Posts").insert([{ content: text }]);
    try {
      const response = await axios.post(import.meta.env.VITE_API_HOST + '/posts', { content: text });
      // console.log(response);

      toast({
        title: "Success",
        description: "Your post has been created",
      });

      refetch();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          JWT Verifier
        </h1>
        <TextSubmissionForm onSubmit={handleSubmit} />
        <SubmissionsTable submissions={submissions} />
      </div>
    </div>
  );
};

export default Index;