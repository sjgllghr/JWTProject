import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TextSubmissionFormProps {
  onSubmit: (text: string) => void;
}

const TextSubmissionForm = ({ onSubmit }: TextSubmissionFormProps) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          className="flex-1"
        />
        <Button type="submit" className="w-full sm:w-auto">
          Submit
        </Button>
      </div>
    </form>
  );
};

export default TextSubmissionForm;