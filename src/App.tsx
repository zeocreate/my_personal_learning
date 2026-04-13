import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { KnowledgeProvider } from "@/context/KnowledgeContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import CategoryView from "@/pages/CategoryView";
import TopicView from "@/pages/TopicView";
import NoteEditor from "@/pages/NoteEditor";
import TagView from "@/pages/TagView";
import Profile from "@/pages/Profile";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <KnowledgeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/category/:id" element={<CategoryView />} />
              <Route path="/topic/:id" element={<TopicView />} />
              <Route path="/note/:id" element={<NoteEditor />} />
              <Route path="/tag/:name" element={<TagView />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </KnowledgeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
