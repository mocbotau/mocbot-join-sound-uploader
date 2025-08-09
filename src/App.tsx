import { Button } from "@/ui/button";

function Navbar() {
  return (
    <div className="min-h-screen bg-muted">
      <nav className="fixed top-0 h-16 bg-background border dark:border-slate-700/70 w-screen">
        <div className="h-full flex items-center justify-between mx-auto px-4">
          <img src={"/MOCBOT_trans.png"} alt="Logo" className="h-[70%] pb-1" />
          <div className="flex items-center gap-3">
            <Button variant="default" className="rounded-full hover:cursor-pointer">
              Sign In
            </Button>
          </div>
        </div>
      </nav>
    </div>

  );
};

export default function App() {
  return (
    <Navbar />
  )
}
